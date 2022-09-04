import { serve } from 'std/http/server.ts'

const abortController = new AbortController()

export const websockets = (eventTarget: EventTarget) => {
  
  const clients: Set<WebSocket> = new Set()
  
  const module = {
    reloadClients: () => {
      for (const client of clients) {
        if (client.readyState === 1) {
          client.send('RELOAD')
        }
      }
    },
    close: () => abortController.abort('Closing')
  }

  eventTarget.addEventListener('file', () => {
    module.reloadClients()
  })

  serve(function (req: Request) {
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
    port: 8007,
    signal: abortController.signal,
    onListen: () => null
  })

  return module
}