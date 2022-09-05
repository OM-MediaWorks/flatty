import { streamToString } from '../helpers/streamToString.ts'
import { QueryContext } from '../types.ts'

export const execute = async (context: QueryContext) => {
  const response = await context.engine.query(context.query, {
    sources: [context.store],
    unionDefaultGraph: true
  })

  if (response.resultType === 'quads') {
    const quadStream = await response.execute()

    if (context.serialize) {
      const { data } = await context.engine.resultToString(response, 'application/n-quads')
      context.results = await streamToString(data)
    }
    else {
      context.results = quadStream.toArray()
    }
  }
  else if (response.resultType === 'bindings') {
    const { data } = await context.engine.resultToString(response, 'application/sparql-results+json')
    const text = await streamToString(data)
    context.results = context.serialize ? text : JSON.parse(text)
  }

  return context.results
}