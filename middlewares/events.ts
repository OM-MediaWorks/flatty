import { QueryContext } from '../types.ts'

export const events = async (context: QueryContext, next: Function) => {
  const done = await next()
  console.log('events')

  return done
}