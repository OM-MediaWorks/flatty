import { Middleware, QueryContext } from '../../types.ts'
import { fire } from '../../helpers/fire.ts'

export class Events implements Middleware {
  async execute (context: QueryContext, next: Function) {
    const type = context.parsedQuery.queryType ?? context.parsedQuery.type

    const beforeHooks = [
      `before:query`,
      `before:query:${type}`
    ]
    
    fire(beforeHooks, context.eventTarget, context)
    const result = await next()
  
    const afterHooks = [
      `after:query`,
      `after:query:${type}`
    ]
    
    fire(afterHooks, context.eventTarget, context) 

    return result
  }
} 