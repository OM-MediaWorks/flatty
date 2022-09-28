import { QueryContext } from '../types.ts'
import { walker } from '../helpers/walker.ts'
import { SparqlGenerator, NamedNode } from '../deps.ts'

export const ensureGraph = (context: QueryContext, next: Function) => {
  const { parsedQuery } = context

  if (parsedQuery.type === 'update') {
    walker(parsedQuery, (key, value, parent) => {
      if (value.updateType === 'insert') {
        for (const insertBlock of value.insert) {
          if (insertBlock.type === 'bgp') {
            insertBlock.type = 'graph'
            const subject = insertBlock.triples[0].subject.value
            insertBlock.name = new NamedNode(subject)
          }
        }
      }
    })

    const writer = new SparqlGenerator()
    context.query = writer.stringify(parsedQuery)
    console.log(context.query)
  }
  return next()
}