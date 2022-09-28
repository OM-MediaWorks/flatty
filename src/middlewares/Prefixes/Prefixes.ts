import { QueryContext } from '../../types.ts'
import { allPrefixes } from '../../helpers/allPrefixes.ts'
import { Middleware } from '../../types.ts'
import { JsonLdContextNormalized } from '../../deps.ts'

export class Prefixes implements Middleware {

  execute (context: QueryContext, next: Function) {
    Object.assign(allPrefixes, context.parsedQuery.prefixes)
    context.context = new JsonLdContextNormalized({
      ...context.context.getContextRaw(),
      ...allPrefixes
    })
    return next()
  }

}