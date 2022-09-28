import { QueryContext } from '../../types.ts'
import { allPrefixes } from '../../helpers/allPrefixes.ts'
import { Middleware } from '../../types.ts'

export class Prefixes implements Middleware {

  execute (context: QueryContext, next: Function) {
    Object.assign(allPrefixes, context.parsedQuery.prefixes)
    return next()
  }

}