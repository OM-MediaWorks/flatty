import { streamToString } from '../../helpers/streamToString.ts'
import { Middleware, QueryContext } from '../../types.ts'

export class Execute implements Middleware {

  #sourcesgatherer: (context: QueryContext) => Array<any>

  constructor (sourcesgatherer?: (context: QueryContext) => Array<any>) {
    this.#sourcesgatherer = sourcesgatherer ?? (() => [])
  }

  async execute(context: QueryContext, next: Function) {
    const sources = [typeof context.store === 'string' ? { type: 'sparql', value: context.store } : context.store, ...this.#sourcesgatherer(context)]

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