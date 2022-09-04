import { assertEquals, assertExists } from 'std/testing/asserts.ts'
import { FlatFileTripleStore } from './mod.ts'
import { QueryContext } from './types.ts'

const acl = (_context: QueryContext, next: Function) => {
  return next()
}

const awaitEvent = (target: EventTarget, eventName: string): Promise<CustomEvent> => {
  return new Promise((resolve) => {
    target.addEventListener(eventName, (event) => {
      resolve(event as CustomEvent)
    })
  })
}

Deno.test('Starting a store', async (test) => {

  const store = await new FlatFileTripleStore({
    folder: './test-data',
    middlewares: [acl]
  })

  await test.step('Select query results in bindings', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }')
    assertEquals(bindings.length, 14)
  })

  await test.step('Describe query results in quads', async () => {
    const quads = await store.query('DESCRIBE <https://danielbeeke.nl>')
    assertEquals(quads.length, 10)
  })

  await test.step('middleware events: test event', async () => {
    const query = 'SELECT * { ?s ?p ?o }'

    awaitEvent(store, 'query:SELECT').then((event) => {
      assertEquals(event.detail.query, query)
    })

    await store.query<'s' | 'p' | 'o'>(query)
  })

  await test.step('Connect websocket', async () => {
    const socket = new WebSocket('ws://localhost:8007')
    assertExists(socket)
    await awaitEvent(store, 'subscription')

    const path = './test-data/daniel-beeke.ttl'
    const originalText = Deno.readTextFileSync(path)
    const mutatedText = originalText + '\n'
    Deno.writeTextFileSync(path, mutatedText)

    const message = await awaitEvent(socket, 'message') as unknown as MessageEvent
    assertExists(message)
    assertEquals(message.data, 'RELOAD')

    socket.close()
    Deno.writeTextFileSync(path, originalText)
  })

  store.close()

})

