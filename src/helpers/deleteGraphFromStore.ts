import { Store, NamedNode } from '../deps.ts'

export const deleteGraphFromStore = (store: Store, graphUri: string) => {
  const graphQuads = store.getQuads(null, null, null, new NamedNode(graphUri))
  for (const quad of graphQuads) store.removeQuad(quad)
}