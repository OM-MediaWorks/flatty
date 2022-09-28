import { Middleware, QueryContext } from '../../types.ts'
import { walker } from '../../helpers/walker.ts'
import { SparqlGenerator } from '../../deps.ts'
import { allPrefixes } from '../../helpers/allPrefixes.ts'
import { replaceInsertWithMultipleGraphInserts } from './replaceInsertWithMultipleGraphInserts.ts'

/**
 * This middleware makes sure insertion of data always happens into a named graph.
 * TODO Try to make a test on the output and throw an error when there are quads with the default graph.
 */
export class ForceGraph implements Middleware {

  execute (context: QueryContext, next: Function) {
    let madeChanges = false
    const { parsedQuery } = context

    walker(parsedQuery, (key: string, value: any, _parent: any) => {
      if (key === 'insert') {
        for (const insert of value) {
          const namedSubjects: Set<string> = new Set()

          if (insert.type !== 'graph') {
            // Named subjects.
            for (const triples of insert.triples) if (triples.subject.termType === 'NamedNode') namedSubjects.add(triples.subject.value)
            if (namedSubjects.size) {
              for (const namedSubject of namedSubjects) context.graphs.add(namedSubject)
              replaceInsertWithMultipleGraphInserts(value, insert, namedSubjects)
              madeChanges = true
            }
          }

          // This inserts the graph of GRAPH objects into the context.
          if (insert.type === 'graph') {
            for (const triples of insert.triples) if (triples.subject.termType === 'NamedNode') context.graphs.add(triples.subject.value)
          }
        }
      }
    })

    if (madeChanges) {
      const generator = new SparqlGenerator({ prefixes: allPrefixes })
      context.parsedQuery = parsedQuery
      context.query = generator.stringify(parsedQuery)  
    }

    return next()
  }
  
} 
