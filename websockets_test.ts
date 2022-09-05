import { assertEquals, assertExists } from 'std/testing/asserts.ts'
import { FlatFileTripleStore } from './mod.ts'
import { it, describe } from 'std/testing/bdd.ts'
import { awaitEvent } from './helpers/awaitEvent.ts'

describe('Websockets', () => {
  it('Connect websocket and gets notified of file change', async () => {
    const store = await new FlatFileTripleStore({
      folder: './test-data',
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