import { assertEquals } from '../../deps.ts'
import { Store, NamedNode, Literal, Quad } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { allPrefixes } from '../../helpers/allPrefixes.ts'

describe('Middleware prefixes', () => {
  let store: Flatty
  let n3Store: Store

  beforeAll(async () => {
    n3Store = new Store([
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

  it('adds prefixes', async () => {
    await store.query('PREFIX ex:<http://example.com> SELECT * { ?s ex:b ?o }')
    assertEquals(allPrefixes.ex, 'http://example.com')
  })

})

