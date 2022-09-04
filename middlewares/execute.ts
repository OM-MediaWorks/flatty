import { streamToString } from '../helpers/streamToString.ts'
import { QueryContext } from '../types.ts'

export const execute = async (context: QueryContext, next: Function) => {
  const response = await context.engine.query(context.query, {
    sources: [context.store],
    unionDefaultGraph: true
  })

  if (response.resultType === 'quads') {
    const { data } = await context.engine.resultToString(response, 'application/n-quads')
    context.results = await streamToString(data)
  }
  else if (response.resultType === 'bindings') {
    const { data } = await context.engine.resultToString(response, 'application/sparql-results+json')
    const json = JSON.parse(await streamToString(data))
    context.results = json.results.bindings
  }

  console.log('execute')
  return context.results
}