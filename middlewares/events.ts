import { QueryContext } from '../types.ts'

export const events = (context: QueryContext, next: Function) => {
  const hooks = [
    /** @ts-ignore */
    `query:${context.parsedQuery.queryType}`
  ]

  for (const hook of hooks) {
    context.eventTarget.dispatchEvent(new CustomEvent(hook, { detail: context }))
  }

  return next()
}