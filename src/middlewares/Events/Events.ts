import { Middleware, QueryContext } from '../../types.ts'
import { fire } from '../../helpers/fire.ts'
import { Flatty } from '../../Flatty.ts'
import { Websockets } from '../Websockets/Websockets.ts'

export class Events implements Middleware {

  #flatty: Flatty

  constructor (flatty: Flatty) {
    this.#flatty = flatty
  }

  async execute (context: QueryContext, next: Function) {
    const wsServer = this.#flatty.middlewares.Websockets as Websockets
    const type = context.parsedQuery.queryType ?? context.parsedQuery.type

    const beforeHooks = [
      `before:query`,
      `before:query:${type}`
    ]
    
    fire(beforeHooks, context.eventTarget, context)
    
    if (wsServer) {
      beforeHooks.forEach(hook => wsServer.message({ event: hook }))
    }

    const result = await next()
  
    const afterHooks = [
      `after:query`,
      `after:query:${type}`
    ]
    
    fire(afterHooks, context.eventTarget, context) 

    if (wsServer) {
      afterHooks.forEach(hook => wsServer.message({ event: hook }))
    }

    return result
  }
} 