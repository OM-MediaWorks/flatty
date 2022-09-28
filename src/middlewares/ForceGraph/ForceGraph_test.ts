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

describe('Middleware events', async () => {
  const filePrefix = './src/middlewares/ForceGraph/test-queries'
  for await (const dirEntry of Deno.readDir(`${filePrefix}/given`)) {
    const givenSparql = Deno.readTextFileSync(`${filePrefix}/given/${dirEntry.name}`)
    const expectedSparql = Deno.readTextFileSync(`${filePrefix}/expected/${dirEntry.name}`)
      it(`tests ${dirEntry.name}`, () => {
        testQueries(givenSparql, expectedSparql)
      })
  }
})

