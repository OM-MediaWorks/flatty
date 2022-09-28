import { Store, Parser as TurtleParser } from '../deps.ts'
import { allPrefixes } from '../helpers/allPrefixes.ts'

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

    turtleParser.parse(fileContents, (error, quad, prefixes) => {
      if (quad) store.addQuad(quad)
      if (prefixes) {
        Object.assign(allPrefixes, prefixes)
      }
    })
  }
  catch (exception) {
    console.error(exception)
  }
}