import { Store, Parser as TurtleParser, DataFactory } from '../deps.ts'
import { allPrefixes } from '../helpers/allPrefixes.ts'

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
    deleteGraphFromStore(store, graphUri)

    const tempStore = new Store(await turtleParser.parse(fileContents))
    const subjectsThatAreOnlySubject = []
    for (const subject of tempStore.getSubjects(null, null, null)) {
      const placesWhereSubjectIsObject = tempStore.getQuads(null, null, subject, null)
      if (!placesWhereSubjectIsObject.length)
        subjectsThatAreOnlySubject.push(subject)
    }

    for (const subject of subjectsThatAreOnlySubject) {
      
    }

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