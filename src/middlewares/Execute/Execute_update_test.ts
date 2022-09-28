import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { it, describe } from '../../deps.ts'
import { testMiddlewares } from '../testMiddlewares.ts'

describe('Middleware execute', () => {
  it('Inserts data', async () => {
    const store = await new Flatty({
      middlewares: testMiddlewares
    })

    const [ countResponse ] = await store.query<'count'>(`SELECT (count(?s) as ?count) { ?s ?p ?O }`)
    const count = parseInt(countResponse.count.value)

    await store.query(`
      PREFIX dcterms: <http://purl.org/dc/terms/>
      
      INSERT DATA {
          GRAPH <http://example/shelf_A> {
              <http://example/author> dcterms:name "author" .
              <http://example/book> dcterms:title "book" ;
                                    dcterms:author <http://example/author> .  
          } 
    }`)

    const response = await store.query('SELECT * { ?s ?p ?o }')
    assertEquals(response.length > count, true)
    await store.stop()
  })

})

