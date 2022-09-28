import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { WriteGraphs } from './WriteGraphs.ts'
import { testMiddlewares } from '../testMiddlewares.ts'

describe('Middleware WriteGraphs', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        ...testMiddlewares,
        WriteGraphs: new WriteGraphs('./src/test-data', {
          'http://example/Book': 'Books',
          'default': 'contents'
        })
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
                                    a  <http://example/Book> ;
                                    dcterms:author <http://example/author> .  
    }`)

    const author = Deno.readTextFileSync(`${Deno.cwd()}/src/test-data/contents/ex:author.ttl`)
    assertEquals(author.trim(), '<http://example.com/author> <http://purl.org/dc/terms/name> "author".')
    await Deno.remove(`${Deno.cwd()}/src/test-data/contents/ex:author.ttl`)
    await Deno.remove(`${Deno.cwd()}/src/test-data/contents`)
    await Deno.remove(`${Deno.cwd()}/src/test-data/Books/ex:book.ttl`)
    await Deno.remove(`${Deno.cwd()}/src/test-data/Books`)
  })

})

