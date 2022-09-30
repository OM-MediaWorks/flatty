import { assertEquals } from '../../deps.ts'
import { Store, NamedNode, Literal, Quad } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { it, describe } from '../../deps.ts'
import { testMiddlewares } from '../testMiddlewares.ts'
import { Subscribe } from './Subscribe.ts'
import { Websockets } from '../Websockets/Websockets.ts'
import { awaitEvent } from '../../helpers/awaitEvent.ts'

describe('Middleware Subscribe', () => {
  it('subscribes to a query', async () => {
    const n3Store = new Store([
      new Quad(new NamedNode('http://example.com/#test'), new NamedNode('http://example.com/#a'), new Literal('A'), new NamedNode('http://example.com/#test')),
      new Quad(new NamedNode('http://example.com/#test'), new NamedNode('http://example.com/#b'), new Literal('B'), new NamedNode('http://example.com/#test'))
    ])

    const store = await new Flatty({
      store: n3Store,
      middlewares: {
        ...testMiddlewares,
        Subscribe: new Subscribe(),
        Websockets: new Websockets(8007)
      }
    })

    const socket = new WebSocket('ws://localhost:8007')
    await awaitEvent(store, 'websocket:opened')

    const query = 'SELECT * { ?s ?p ?o }'

    const eventPromise = awaitEvent(socket, 'message', (event) => event.data.includes('subscriptionChanged'))
    socket.send(JSON.stringify({ subscribe: query }))

    await awaitEvent(store, 'subscribed')

    await store.query(`
      PREFIX dcterms: <http://purl.org/dc/terms/>
      
      INSERT DATA {
          GRAPH <http://example/shelf_A> {
              <http://example/author> dcterms:name "author" .
              <http://example/book> dcterms:title "book" ;
                                    dcterms:author <http://example/author> .  
          } 
    }`)

    const event = await eventPromise

    const message = JSON.parse((event as unknown as MessageEvent).data)
    assertEquals(message.subscriptionChanged, query)

    socket.close()
    await awaitEvent(socket, 'close')

    await store.stop()
  })

})

