import { Prefixes, Parser, Quad, Store } from '../deps.ts'

export const turtleToStore = (text: string): Promise<{ store: Store, prefixes: Prefixes }> => {
  const parser = new Parser()
  const store = new Store()

  return new Promise((resolve, reject) => {
    parser.parse(text, (error: Error, quad: Quad, prefixes: Prefixes) => {
      if (error) reject(error)
      if (quad) store.addQuad(quad)
      else resolve({ store, prefixes })
    });  
  })
}
