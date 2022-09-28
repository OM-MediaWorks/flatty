import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { awaitEvent } from '../../helpers/awaitEvent.ts'

describe('Middleware events', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty()
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

})

