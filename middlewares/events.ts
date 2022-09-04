import { QueryContext } from '../types.ts'
import { Parser } from 'sparqljs'

export const events = (context: QueryContext, next: Function) => {
  const sparqlParser = new Parser()
  const parsedQuery = sparqlParser.parse(context.query)

  const hooks = [
    /** @ts-ignore */
    `query:${parsedQuery.queryType}`
  ]

  for (const hook of hooks) {
    context.eventTarget.dispatchEvent(new CustomEvent(hook, { detail: context }))
  }

  return next()
}