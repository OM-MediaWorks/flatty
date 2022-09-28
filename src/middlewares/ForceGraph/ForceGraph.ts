import { Middleware, QueryContext } from '../../types.ts'
import { walker } from '../../helpers/walker.ts'
import { SparqlGenerator } from '../../deps.ts'

export class ForceGraph implements Middleware {
  execute (context: QueryContext, next: Function) {

    const { parsedQuery } = context
    walker(parsedQuery, (key: string, value: any, parent: any) => {
      if (key === 'insert') {
        for (const insertion of value) {
          const subjects = new Set()

          if (insertion.type !== 'graph') {
            const insertionIndex = value.indexOf(insertion)
            value.splice(insertionIndex, 1)

            for (const triples of insertion.triples) {
              if (triples.subject.termType === 'NamedNode') {
                subjects.add(triples.subject.value)
              }
            }

            for (const subject of subjects) {
              const newInsertion = JSON.parse(JSON.stringify(insertion))
              newInsertion.type = 'graph'

              newInsertion.name = {
                'termType': 'NamedNode',
                'value': subject
              }
  
              newInsertion.triples = insertion.triples.filter((triples: any) => triples.subject?.value === subject)
              value.push(newInsertion)
            } 
          }
        }
      }
    })

    const generator = new SparqlGenerator()
    context.parsedQuery = parsedQuery
    context.query = generator.stringify(parsedQuery)

    return next()
  }
} 