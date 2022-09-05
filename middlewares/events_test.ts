import { assertEquals } from 'std/testing/asserts.ts'
import { FlatFileTripleStore } from '../mod.ts'
import { beforeAll, afterAll, it, describe } from 'std/testing/bdd.ts'
import { awaitEvent } from '../helpers/awaitEvent.ts'

describe('Middleware events', () => {
  let store: FlatFileTripleStore

  beforeAll(async () => {
    store = await new FlatFileTripleStore({
      folder: './test-data',
    })
  })

  afterAll(async () => {
    await store.close()
  })

  it('test event', async () => {
    const query = 'SELECT * { ?s ?p ?o }'

    awaitEvent(store, 'query:SELECT').then((event) => {
      assertEquals(event.detail.query, query)
    })

    await store.query<'s' | 'p' | 'o'>(query)
  })

})

