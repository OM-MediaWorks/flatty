import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { streamToString } from '../../helpers/streamToString.ts'
import { normalize } from '../../deps.ts'

export class WriteGraphs implements Middleware {

  #folder: string

  constructor (folder: string) {
    this.#folder = folder
  }

  init (flatty: Flatty) {
    if (!flatty.middlewares.ForceGraph) throw new Error('The middleware WriteGraphs requires the ForceGraph middleware.')
  }

  async execute (context: QueryContext, next: Function) {
    for (const graph of context.graphs) {
      const response = await context.engine.query(`DESCRIBE <${graph}>`, {
        sources: [typeof context.store === 'string' ? { type: 'sparql', value: context.store } : context.store],
        unionDefaultGraph: true
      })
      const { data } = await context.engine.resultToString(response, 'text/turtle')
      const turtle = await streamToString(data)

      const compactedGraph = context.context.compactIri(graph)
      const cleanGraph = compactedGraph.replaceAll(/\//g, '')
      const filePath = normalize(`${Deno.cwd()}/${this.#folder}/${cleanGraph}.ttl`)
      Deno.writeTextFileSync(filePath, turtle)
    }

    return next()
  }
} 