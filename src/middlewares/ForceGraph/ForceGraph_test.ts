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
    simplify: false,
    context: null!,
    graphs: new Set()
  }

  middleware.execute(context, () => null)
  assertEquals(JSON.stringify(parsedQuery), JSON.stringify(parser.parse(expectedQuery)))

  return context
}

const only = false // 'sparql-update-3-1-3.sparql'

describe('Middleware ForceGraphs', async () => {
  const filePrefix = './src/middlewares/ForceGraph/test-queries'
  for await (const dirEntry of Deno.readDir(`${filePrefix}/given`)) {
    try {
      const givenSparql = Deno.readTextFileSync(`${filePrefix}/given/${dirEntry.name}`)
      const expectedSparql = Deno.readTextFileSync(`${filePrefix}/expected/${dirEntry.name}`)
  
      if (givenSparql && expectedSparql && (!only || dirEntry.name === only)) {
        it(`adds graphs to ${dirEntry.name.replace('.sparql', '')}`, () => {
          testQueries(givenSparql, expectedSparql)
        })  
      }  
    }
    catch {
      // We are skipping if not both files are here.
    }
  }

  it('Sets the graphs in the context', () => {
    const context = testQueries(`
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      <http://example/book> dcterms:title "book" ;
                            dcterms:author <http://example/author> .  
    }`, 
    `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      GRAPH <http://example/book> {
        <http://example/book> dcterms:title "book".
        <http://example/book> dcterms:author <http://example/author>.
      }
    }`)

    assertEquals([...context.graphs.values()][0], 'http://example/book')
  })

  it('Sets the graphs in the context also when it did not manipulate', () => {
    const query = `
    PREFIX dcterms: <http://purl.org/dc/terms/>
    
    INSERT DATA {
      GRAPH <http://example/book> {
        <http://example/book> dcterms:title "book".
        <http://example/book> dcterms:author <http://example/author>.
      }
    }`

    const context = testQueries(query, query)

    assertEquals([...context.graphs.values()][0], 'http://example/book')
  })
})

