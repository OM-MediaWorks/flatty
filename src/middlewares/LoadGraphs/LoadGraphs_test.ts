import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { testMiddlewares } from '../testMiddlewares.ts'
import { LoadGraphs } from './LoadGraphs.ts'

describe('Middleware LoadGraphs', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        LoadGraphs: new LoadGraphs('./src/test-data'),
        ...testMiddlewares,
      }
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('loads turtle files into the N3 store', async () => {
    const bindings = await store.query('SELECT * { <https://danielbeeke.nl/#me> ?p ?o }')
    assertEquals(bindings.length > 0, true)
  })

})

