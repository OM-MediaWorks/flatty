import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { awaitEvent } from '../../helpers/awaitEvent.ts'
import { testMiddlewares } from '../testMiddlewares.ts'

describe('Middleware events', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: testMiddlewares
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('test event', async () => {
    const query = 'SELECT * { ?s ?p ?o }'

    awaitEvent(store, 'before:query:SELECT').then((event: any) => {
      assertEquals(event.detail.query, query)
    })

    awaitEvent(store, 'after:query:SELECT').then((event: any) => {
      assertEquals(event.detail.query, query)
    })

    await store.query<'s' | 'p' | 'o'>(query)
  })

  // The default middleware setup has Events and ForceGraph.
  // There for we can test this combination.
  // When ForceGraph is not enabled the graphs might not be available.
  it ('exposes graphs via the event after an INSERT DATA', async () => {
    const query = `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      <http://example/book> dcterms:title "book" ;
                            dcterms:author <http://example/author> .  
    }
    `

    awaitEvent(store, 'after:query').then((event: any) => {
      assertEquals(event.detail.graphs.size, 1)
      assertEquals([...event.detail.graphs.values()][0], 'http://example/book')
    })

    await store.query(query)
  })

})

