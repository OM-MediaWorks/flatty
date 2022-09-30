import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { MultiSourceExecute } from './MultiSourceExecute.ts'

describe('Middleware execute', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        MultiSourceExecute: new MultiSourceExecute(() => {
          return ['https://danielbeeke.nl']
        })
      }
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('Select query results in bindings', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }', false, false)
    assertEquals(bindings.results.bindings.length > 15, true)
  })

})

