import { streamToString } from '../../helpers/streamToString.ts'
import { Middleware, QueryContext } from '../../types.ts'

export class Execute implements Middleware {

  #sourcesGatherer: (context: QueryContext) => Array<any>

  constructor (sourcesGatherer?: (context: QueryContext) => Array<any>) {
    this.#sourcesGatherer = sourcesGatherer ?? (() => [])
  }

  async execute(context: QueryContext, next: Function) {
    const sources = [typeof context.source === 'string' ? { type: 'sparql', value: context.source } : context.source, ...this.#sourcesGatherer(context)]

    const response = await context.engine.query(context.query, { sources, unionDefaultGraph: true })
    
    if (response.resultType === 'quads') {
      const quadStream = await response.execute()
  
      if (context.serialize) {
        const { data } = await context.engine.resultToString(response, typeof context.serialize === 'string' ? context.serialize : 'application/n-quads')
        context.results = await streamToString(data)
      }
      else {
        context.results = await quadStream.toArray()
      }
    }
    else if (response.resultType === 'bindings') {
      const { data } = await context.engine.resultToString(response, 'application/sparql-results+json')
      const text = await streamToString(data)
      context.results = context.serialize ? text : context.simplify ? JSON.parse(text).results.bindings : JSON.parse(text)
    }
    else if (response.resultType === 'void') {
      await response.execute()
  
      context.results = {
        done: true
      }
    }
  
    await next()

    return context.results
  }
  
}