import { Middleware, QueryContext } from '../../types.ts'
import { fire } from '../../helpers/fire.ts'

export class Events implements Middleware {
  async execute (context: QueryContext, next: Function) {
    const beforeHooks = [
      `before:query`,
      `before:query:${context.parsedQuery.queryType}`
    ]
    
    fire(beforeHooks, context.eventTarget, context)
    const result = await next()
  
    const afterHooks = [
      `after:query`,
      `after:query:${context.parsedQuery.queryType}`
    ]

    fire(afterHooks, context.eventTarget, context) 

    return result
  }
} 