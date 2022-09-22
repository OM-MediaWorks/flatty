import { assertEquals } from 'std/testing/asserts.ts'
import { Flatty } from '../mod.ts'
import { beforeAll, afterAll, it, describe } from 'std/testing/bdd.ts'

describe('Middleware execute', () => {
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

  it('Select query results in bindings', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }')
    assertEquals(bindings.results.bindings.length, 14)
  })

  it('Select query results in bindings serialized', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }', true)
    assertEquals(typeof bindings, 'string')
  })

  it('Describe query results in quads', async () => {
    const quads = await store.query('DESCRIBE <https://danielbeeke.nl>')
    assertEquals(quads.length, 10)
  })

  it('Describe query results in quads serialized', async () => {
    const quads = await store.query('DESCRIBE <https://danielbeeke.nl>', true)
    assertEquals(typeof quads, 'string')
  })

})

