import { QueryContext } from '../types.ts'

const fire = (hooks: Array<string>, eventTarget: EventTarget, detail: any) => {
  for (const hook of hooks) {
    eventTarget.dispatchEvent(new CustomEvent(hook, { detail }))
  }
}

export const events = async (context: QueryContext, next: Function) => {
  const beforeHooks = [
    `before:query`,
    `before:query:${context.parsedQuery.queryType}`
  ]

  const afterHooks = [
    `after:query`,
    `after:query:${context.parsedQuery.queryType}`
  ]

  fire(beforeHooks, context.eventTarget, context)
  const result = await next()
  fire(afterHooks, context.eventTarget, context) 
  return result
}