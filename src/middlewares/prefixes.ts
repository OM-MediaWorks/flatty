import { QueryContext } from '../types.ts'
import { allPrefixes } from '../helpers/allPrefixes.ts'

export const prefixes = (context: QueryContext, next: Function) => {
  Object.assign(allPrefixes, context.parsedQuery.prefixes)
  return next()
}