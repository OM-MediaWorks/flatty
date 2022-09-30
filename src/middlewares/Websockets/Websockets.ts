import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { serve, debounce } from '../../deps.ts'
import { Subscribe } from '../Subscribe/Subscribe.ts'

export class Websockets implements Middleware {

  #port: number
  #sockets: Set<WebSocket> = new Set()
  #flatty: Flatty
  #abortController: AbortController
  #servePromise: Promise<void>
  #debouncer: any

  constructor (port: number = 8001) {
    this.#port = port
    this.#flatty = null!
    this.#servePromise = null!
    this.#debouncer = null!
    this.#abortController = new AbortController()
  }

  init (flatty: Flatty) {
    this.#flatty = flatty
    this.#servePromise = this.startServer()

    this.#debouncer = debounce((event) => {
      this.message({
        command: 'reload',
        event: event.detail
      })
    }, 100)
  
    this.#flatty.addEventListener('file', this.#debouncer)
  }

  startServer () {
    return serve((req: Request) => {
      if (req.headers.get('upgrade') !== 'websocket') {
        return new Response(null, { status: 501 })
      }
  
      const { socket, response } = Deno.upgradeWebSocket(req)
      this.handleSocket(socket)

      return response
    }, { 
      port: this.#port,
      signal: this.#abortController.signal,
      onListen: () => null
    })
  }

  message (meta: any) {
    for (const socket of this.#sockets) {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(meta))
      }
    }
  }

  handleSocket (socket: WebSocket) {
    socket.onopen = () => {
      this.#sockets.add(socket)
      this.#flatty!.dispatchEvent(new CustomEvent('websocket:opened', { detail: socket }))
    }
    
    socket.onclose = () => {
      this.#sockets.delete(socket)
      this.#flatty!.dispatchEvent(new CustomEvent('websocket:closed', { detail: socket }))
    }

    socket.onmessage = (message) => {
      try {
        const json = JSON.parse(message.data)
        if (json.subscribe && this.#flatty.middlewares.Subscribe) {
          const query = json.subscribe as string
          (this.#flatty.middlewares.Subscribe as Subscribe).subscribe(query, () => {
            if (socket.readyState === socket.OPEN) {
              socket.send(JSON.stringify({ subscriptionChanged: query }))
            }
          })
        } 
      }
      catch (exception) {
        console.error(exception)
      }
    }

    socket.onerror = (e) => console.error(e)
  }

  async stop () {
    this.#debouncer.clear()
    this.#abortController.abort('Closing')
    await this.#servePromise
  }

  execute (context: QueryContext, next: Function) {
    return next()
  }
} 
