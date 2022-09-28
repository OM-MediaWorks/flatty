import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { streamToString } from '../../helpers/streamToString.ts'
import { normalize, ensureDirSync } from '../../deps.ts'

export class WriteGraphs implements Middleware {

  #folder: string
  #mapping: { [key: string]: string }

  constructor (folder: string, mapping: { [key: string]: string } = {}) {
    this.#folder = folder
    this.#mapping = mapping
  }

  init (flatty: Flatty) {
    if (!flatty.middlewares.ForceGraph) throw new Error('The middleware WriteGraphs requires the ForceGraph middleware.')
  }

  async execute (context: QueryContext, next: Function) {
    const sources = [typeof context.store === 'string' ? { type: 'sparql', value: context.store } : context.store] 

    for (const graph of context.graphs) {
      const response = await context.engine.query(`CONSTRUCT { ?s ?p ?o } FROM <${graph}> WHERE { ?s ?p ?o }`, { sources })
      const { data } = await context.engine.resultToString(response, 'text/turtle')
      const turtle = await streamToString(data)

      const typeResponse = await context.engine.query(`SELECT ?type WHERE { <${graph}> a ?type }`, { sources, unionDefaultGraph: true })
      const { data: typeData } = await context.engine.resultToString(typeResponse, 'application/sparql-results+json')
      const typeBindings = JSON.parse(await streamToString(typeData))
      const type = typeBindings.results.bindings[0]?.type.value

      const compactedGraph = context.context.compactIri(graph)
      const cleanGraph = compactedGraph.replaceAll(/\//g, '')
      const dir = normalize(`${Deno.cwd()}/${this.#folder}/${this.#mapping[type] ?? this.#mapping['default'] ?? ''}/`)
      const filePath = normalize(`${dir}/${cleanGraph}.ttl`)
      ensureDirSync(dir)
      Deno.writeTextFileSync(filePath, turtle)
    }

    return next()
  }
} 