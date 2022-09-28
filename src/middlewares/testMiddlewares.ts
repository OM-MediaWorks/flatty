import { Execute } from './Execute/Execute.ts'
import { Events } from './Events/Events.ts'
import { Prefixes } from './Prefixes/Prefixes.ts'
import { ForceGraph } from './ForceGraph/ForceGraph.ts'

export const testMiddlewares = {
  Prefixes: new Prefixes(),
  ForceGraph: new ForceGraph(),
  Events: new Events(),
  Execute: new Execute(),
}