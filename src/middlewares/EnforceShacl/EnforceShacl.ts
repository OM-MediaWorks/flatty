import { NamedNode, Store, SHACLValidator } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { QueryEngine } from '../../deps.ts'

type ResolverCallback = (rdfClassIRI: string) => Promise<Store | undefined> | Store | undefined

export class EnforceShacl implements Middleware {

  #resolver: ResolverCallback
  #flatty: Flatty
  #allowMissingShapes: boolean

  constructor ({ resolver, allowMissingShapes }: { resolver: ResolverCallback, allowMissingShapes?: boolean }) {
    this.#resolver = resolver
    this.#flatty = null!
    this.#allowMissingShapes = allowMissingShapes ?? false
  }

  init (flatty: Flatty) {
    this.#flatty = flatty
  }

  async execute(context: QueryContext, next: Function) {
    const { parsedQuery, graphs, query } = context

    if (parsedQuery.type === 'update') {
      const testStore = new Store()

      const existingQuads = await this.#flatty.query(`CONSTRUCT { ?s ?p ?o } 
        WHERE { 
          GRAPH ?g { ?s ?p ?o } 
          VALUES ?g { ${[...graphs.values()].map(graph => `<${graph}>`).join(' ')} }
        }
      `)

      testStore.addQuads(existingQuads)
      const engine = new QueryEngine()
      await engine.queryVoid(query, { sources: [testStore] })

      const types = testStore.getQuads(null, new NamedNode('http://www.w3.org/1999/02/22-rdf-syntax-ns#type'), null, null)
        .map(quad => quad.object.value)

      for (const type of types) {
        const shaclStore = await this.#resolver(type)
        if (!shaclStore && !this.#allowMissingShapes) throw new Error(`Missing SHACL Shape for ${type}`)
        const validator = new SHACLValidator(shaclStore, {})
        const report = await validator.validate(testStore)
        if (!report.conforms) throw new Error(`The data did not validate against the SHACL shape for ${type}`)
      }
    }

    return next()
  }
  
}