import { Store, Parser as TurtleParser, NamedNode, Quad } from '../deps.ts'
import { allPrefixes } from '../helpers/allPrefixes.ts'
import { fileToGraphsMapping } from '../helpers/fileToGraphsMapping.ts'
import { deleteGraphFromStore } from '../helpers/deleteGraphFromStore.ts'

const turtleParser = new TurtleParser()

export const addTurtleFileToStore = async (store: Store, path: string) => {
  const fileContents = await Deno.readTextFile(path)

  try {
    const tempStore = new Store(await turtleParser.parse(fileContents))
    const subjectsThatAreOnlySubject = []
    for (const subject of tempStore.getSubjects(null, null, null)) {
      const placesWhereSubjectIsObject = tempStore.getQuads(null, null, subject, null)
      if (!placesWhereSubjectIsObject.length)
        subjectsThatAreOnlySubject.push(subject)
    }

    // TODO When given multiple documents, split them and create seperate graphs

    let graph: string

    turtleParser.parse(fileContents, (error, quad, prefixes) => {
      if (quad) {
        if (!graph) {
          graph = quad.subject.value
          if (!fileToGraphsMapping.has(path)) fileToGraphsMapping.set(path, [])
          const graphs = fileToGraphsMapping.get(path)
          graphs.push(graph)
          deleteGraphFromStore(store, graph)
        }
        store.addQuad(new Quad(quad.subject, quad.predicate, quad.object, new NamedNode(graph)))
      }
      if (prefixes) {
        Object.assign(allPrefixes, prefixes)
      }
    })
  }
  catch (exception) {
    console.error(exception)
  }
}