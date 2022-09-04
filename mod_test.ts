import { assertEquals } from 'https://deno.land/std@0.152.0/testing/asserts.ts'
import { FlatFileTripleStore } from './mod.ts'
import { QueryContext } from './types.ts'

const acl = (_context: QueryContext, next: Function) => {
  console.log('acl')
  return next()
}

const store = await new FlatFileTripleStore({
  rootFolder: './test-data',
  baseURI: 'http://example.com',
  middlewares: [acl]
})

const bindings = await store.query<'s' | 'p' | 'o'>('SELECT * { ?s ?p ?o }')

// console.log(bindings)
console.log('done')