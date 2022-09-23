import { assertEquals } from '../deps.ts'
import { Flatty } from '../mod.ts'
import { beforeAll, afterAll, it, describe } from '../deps.ts'
import { awaitEvent } from '../helpers/awaitEvent.ts'

describe('Middleware events', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      folder: './test-data',
      websocketsPort: false
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

