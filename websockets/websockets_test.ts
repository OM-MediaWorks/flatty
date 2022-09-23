import { assertEquals, assertExists } from '../deps.ts'
import { Flatty } from '../mod.ts'
import { it, describe } from '../deps.ts'
import { awaitEvent } from '../helpers/awaitEvent.ts'

describe('Websockets', () => {
  it('Connect websocket and gets notified of file change', async () => {
    const store = await new Flatty({
      folder: './test-data',
      websocketsPort: 8007
    })
    const socket = new WebSocket('ws://localhost:8007')
    assertExists(socket)
    await awaitEvent(store, 'subscription')

    const path = './test-data/daniel-beeke.ttl'
    const originalText = Deno.readTextFileSync(path)
    const mutatedText = originalText + '\n'
    Deno.writeTextFileSync(path, mutatedText)

    const message = await awaitEvent(socket, 'message') as unknown as MessageEvent
    assertExists(message)
    assertEquals(message.data, '{"path":"/daniel-beeke.ttl","type":"modify"}')

    socket.close()
    await awaitEvent(socket, 'close')

    Deno.writeTextFileSync(path, originalText)
    await store.close()
  })

})