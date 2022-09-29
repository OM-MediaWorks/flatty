import { assertEquals, assertExists } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { it, describe } from '../../deps.ts'
import { Websockets } from './Websockets.ts'
import { testMiddlewares } from '../testMiddlewares.ts'
import { awaitEvent } from '../../helpers/awaitEvent.ts'

describe('Middleware Websockets', () => {
  it('connects to a websocket', async () => {
    const store = await new Flatty({
      middlewares: {
        ...testMiddlewares,
        Websockets: new Websockets(8007)
      }
    })

    const socket = new WebSocket('ws://localhost:8007')
    assertExists(socket)
    await awaitEvent(store, 'websocket:opened')

    const wsServer = store.middlewares.Websockets as Websockets
    wsServer.message({
      message: 'woopwoop'
    })

    const message = await awaitEvent(socket, 'message') as unknown as MessageEvent
    assertExists(message)
    assertEquals(message.data, '{"message":"woopwoop"}')
    
    socket.close()
    await awaitEvent(socket, 'close')

    await store.stop()
  })

})

