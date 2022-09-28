import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { testMiddlewares } from '../testMiddlewares.ts'
import { WatchDisk } from './WatchDisk.ts'
import { LoadGraphs } from '../LoadGraphs/LoadGraphs.ts'
import { awaitEvent } from '../../helpers/awaitEvent.ts'

describe('Middleware WatchDisk', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        LoadGraphs: new LoadGraphs('./src/test-data'),
        WatchDisk: new WatchDisk('./src/test-data'),
        ...testMiddlewares,
      }
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('loads a file into the N3 store when it changes on disk', async () => {
    // Proof daniel-beeke.ttl is loaded
    const foundBindings = await store.query('SELECT * { <https://danielbeeke.nl/#me> ?p ?o }')
    assertEquals(foundBindings.length > 0, true)

    const testFilePath = './src/test-data/daniel-beeke.ttl'
    const daniel = await Deno.readTextFile(testFilePath)
    await Deno.remove(testFilePath)

    // Proof it was removed
    const emptyBindings = await store.query('SELECT * { <https://danielbeeke.nl/#me> ?p ?o }')
    assertEquals(emptyBindings.length, 0)

    const john = daniel
    .replace('foaf:givenName   "Daniel"', 'foaf:givenName   "John"') 
    await Deno.writeTextFile(testFilePath, john)

    await awaitEvent(store, 'file:insert').then(async (event: any) => {
      const [ nameBindings ] = await store.query<'name'>(`
        PREFIX foaf: <http://xmlns.com/foaf/0.1/> 
        SELECT ?name { <https://danielbeeke.nl/#me> foaf:givenName ?name }
      `)
      assertEquals(nameBindings.name.value, 'John')

      await Deno.writeTextFile(testFilePath, daniel)
    })
  })

})

