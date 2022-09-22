import { assertEquals } from 'std/testing/asserts.ts'
import { Flatty } from '../mod.ts'
import { it, describe } from 'std/testing/bdd.ts'
import { awaitResources } from '../helpers/awaitResources.ts'

describe('Middleware execute', () => {
  it('Inserts data', async () => {
    const store = await new Flatty({
      folder: './test-data',
    })

    await store.query(`
      PREFIX dcterms: <http://purl.org/dc/terms/>
      
      INSERT DATA {
          GRAPH <http://example/shelf_A> {
              <http://example/author> dcterms:name "author" .
              <http://example/book> dcterms:title "book" ;
                                    dcterms:author <http://example/author> .  
          } 
    }`)

    const quads = await store.query('SELECT * { ?s ?p ?o }')
    assertEquals(quads.results.bindings.length, 17)
    Deno.removeSync('./test-data/example/shelf_A.ttl')
    Deno.removeSync('./test-data/example')
    await store.close()
    await awaitResources()
  })

})

