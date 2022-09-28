import { assertEquals } from '../../deps.ts'
import { Store, NamedNode, Literal, Quad } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'

describe('Middleware execute', () => {
  let store: Flatty

  beforeAll(async () => {
    const n3Store = new Store([
      new Quad(new NamedNode('http://example.com/#test'), new NamedNode('http://example.com/#a'), new Literal('A'), new NamedNode('http://example.com/#test')),
      new Quad(new NamedNode('http://example.com/#test'), new NamedNode('http://example.com/#b'), new Literal('B'), new NamedNode('http://example.com/#test'))
    ])

    store = await new Flatty({
      store: n3Store
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('Select query results in bindings', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }', false, false)
    assertEquals(bindings.results.bindings.length > 0, true)
  })

  it('Select query results in bindings and returns simple results', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }')
    assertEquals(bindings.length > 0, true)
  })


  it('Select query results in bindings serialized', async () => {
    const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }', true)
    assertEquals(typeof bindings, 'string')
  })

  it('Describe query results in quads', async () => {
    const quads = await store.query('DESCRIBE <http://example.com/#test>')
    assertEquals(quads.length > 0, true)
  })

  it('Describe query results in quads serialized', async () => {
    const quads = await store.query('DESCRIBE <http://example.com/#test>', true)
    assertEquals(typeof quads, 'string')
  })

})

