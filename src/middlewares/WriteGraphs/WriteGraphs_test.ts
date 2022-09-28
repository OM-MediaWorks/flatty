import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { WriteGraphs } from './WriteGraphs.ts'

describe('Middleware WriteGraphs', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        WriteGraphs: new WriteGraphs('./src/test-data')
      }
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('writes out the graph that was previously updated', async () => {
    await store.query(`
      PREFIX dcterms: <http://purl.org/dc/terms/>
      PREFIX ex: <http://example.com/>
      
      INSERT DATA {
              <http://example.com/author> dcterms:name "author" .
              <http://example.com/book> dcterms:title "book" ;
                                    dcterms:author <http://example/author> .  
    }`)

    const author = Deno.readTextFileSync(`${Deno.cwd()}/src/test-data/ex:author.ttl`)
    assertEquals(author.trim(), '<http://example.com/author> <http://purl.org/dc/terms/name> "author".')
    Deno.remove(`${Deno.cwd()}/src/test-data/ex:author.ttl`)
    Deno.remove(`${Deno.cwd()}/src/test-data/ex:book.ttl`)
  })

})

