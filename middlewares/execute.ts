import { streamToString } from '../helpers/streamToString.ts'
import { QueryContext } from '../types.ts'

export const execute = async (context: QueryContext) => {
  const response = await context.engine.query(context.query, {
    sources: [context.store],
    unionDefaultGraph: true
  })

  if (response.resultType === 'quads') {
    const quadStream = await response.execute()
    context.results = await quadStream.toArray()
  }
  else if (response.resultType === 'bindings') {
    const { data } = await context.engine.resultToString(response, 'application/sparql-results+json')
    const json = JSON.parse(await streamToString(data))
    context.results = json.results.bindings
  }

  return context.results
}