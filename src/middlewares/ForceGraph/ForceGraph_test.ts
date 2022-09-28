import { SparqlParser } from '../../deps.ts'
import { it, describe } from '../../deps.ts'
import { ForceGraph } from './ForceGraph.ts'
import { assertEquals } from '../../deps.ts'
import { QueryContext } from '../../types.ts'

const testQueries = (query: string, expectedQuery: string) => {
  const middleware = new ForceGraph()

  const parser = new SparqlParser()
  const parsedQuery = parser.parse(query)
  const context: QueryContext = {
    query,
    store: null!,
    engine: null!,
    eventTarget: null!,
    serialize: false,
    parsedQuery,
    simplify: false
  }

  middleware.execute(context, () => null)
  assertEquals(JSON.stringify(parsedQuery), JSON.stringify(parser.parse(expectedQuery)))
}

describe('Middleware events', () => {

  it('rewrites an INSERT DATA query to always have a graph', () => {
    const query = `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      <http://example/author> dcterms:name "author" .
      <http://example/book> dcterms:title "book" ;
                            dcterms:author <http://example/author> .  
    }`

    const expectedQuery = `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      GRAPH <http://example/author> { <http://example/author> dcterms:name "author". }
      GRAPH <http://example/book> {
        <http://example/book> dcterms:title "book".
        <http://example/book> dcterms:author <http://example/author>.
      }
    }`

    testQueries(query, expectedQuery)
  })

})

