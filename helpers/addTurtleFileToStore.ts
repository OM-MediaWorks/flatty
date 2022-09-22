import { Store, Parser as TurtleParser, DataFactory } from 'n3'
import { allPrefixes } from './allPrefixes.ts'

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
    const graphUri = getGraphUriByPath(path, base)
    console.log(graphUri)
    deleteGraphFromStore(store, graphUri)

    console.log(fileContents)

    turtleParser.parse(fileContents, (error, quad, prefixes) => {
      if (quad) store.addQuad(quad.subject, quad.predicate, quad.object, namedNode(graphUri))
      if (prefixes) {
        Object.assign(allPrefixes, prefixes)
      }
    })
  }
  catch (exception) {
    console.error(exception)
  }
}