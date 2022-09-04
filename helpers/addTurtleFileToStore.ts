import { Quad, Store, Parser as TurtleParser, DataFactory } from 'https://cdn.skypack.dev/n3'
const { namedNode } = DataFactory
const turtleParser = new TurtleParser()

export const deleteGraphFromStore = (store: Store, graphUri: string) => {
  const graphQuads = store.getQuads(null, null, null, namedNode(graphUri))
  for (const quad of graphQuads) store.removeQuad(quad)
}

export const getGraphUriByPath = (path: string, base: string) => {
  const pathSegments = path.split('/')
  const lastPathSegment = pathSegments.at(-1)?.split('.')[0]
  return `${base}/${lastPathSegment}`
}

export const addTurtleFileToStore = async (store: Store, base: string, path: string) => {
  const fileContents = await Deno.readTextFile(path)

  try {
    const quads: Array<Quad> | undefined = turtleParser.parse(fileContents)

    if (quads && quads.length) {
      const graphUri = getGraphUriByPath(path, base)  
      deleteGraphFromStore(store, graphUri)
      
      for (const quad of quads) {
        store.addQuad(quad.subject, quad.predicate, quad.object, namedNode(graphUri))
      }  
    }  
  }
  catch (exception) {
    console.error(exception)
  }
}