import { serve } from 'std/http/server.ts'
import { debounce } from 'std/async/debounce.ts'
const abortController = new AbortController()

export const websockets = (eventTarget: EventTarget, port: number) => {
  
  const clients: Set<WebSocket> = new Set()

  const module = {
    reloadClients: (meta: any) => {
      for (const client of clients) {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify(meta))
        }
      }
    },
    close: () => {
      for (const client of clients) if (client.readyState === client.OPEN) client.close()
      abortController.abort('Closing')
      debouncer.clear()
      return servePromise
    }
  }

  const debouncer = debounce((event) => {
    module.reloadClients(event.detail)
  }, 300)

  eventTarget.addEventListener('file', debouncer)

  const servePromise = serve(function (req: Request) {
    if (req.headers.get('upgrade') !== 'websocket') {
      return new Response(null, { status: 501 })
    }

    const { socket: ws, response } = Deno.upgradeWebSocket(req)
  
    ws.onopen = () => {
      clients.add(ws)
      eventTarget.dispatchEvent(new CustomEvent('subscription', { detail: ws }))
    }
    ws.onclose = () => clients.delete(ws)
    ws.onerror = (e) => console.error(e)
  
    return response
  }, { 
    port,
    signal: abortController.signal,
    onListen: () => null
  })

  return module
}