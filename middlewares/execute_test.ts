import { assertEquals } from 'std/testing/asserts.ts'
import { FlatFileTripleStore } from '../mod.ts'
import { beforeAll, afterAll, it, describe } from 'std/testing/bdd.ts'

describe('Middleware execute', () => {
  let store: FlatFileTripleStore

  beforeAll(async () => {
    store = await new FlatFileTripleStore({
      folder: './test-data',
    })
  })

  afterAll(async () => {
    await store.close()
  })

  it('Select query results in bindings', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }')
    assertEquals(bindings.length, 14)
  })

  it('Describe query results in quads', async () => {
    const quads = await store.query('DESCRIBE <https://danielbeeke.nl>')
    assertEquals(quads.length, 10)
  })

})

