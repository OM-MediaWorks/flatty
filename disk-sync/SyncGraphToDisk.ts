import { Writer, Store, NamedNode, Quad } from '../deps.ts'
import { allPrefixes } from '../helpers/allPrefixes.ts'
import { mutationSkipList } from '../helpers/mutationSkipList.ts'
import { normalize, dirname } from '../deps.ts'
import { ensureDirSync } from '../deps.ts'

export const SyncGraphToDisk = (store: Store, uri: string, base: string, folder: string) => {
  const relativePath = uri
    .replace(base, '')
    .replace('http://', '')
    .replace('https://', '')

  mutationSkipList.add(relativePath)

  const subQuads = store.getQuads(null, null, null, new NamedNode(uri))
    .map(quad => new Quad(quad.subject, quad.predicate, quad.object))

  const subset = new Store(subQuads)
  const lists = subset.extractLists({ remove: true })

  const writer = new Writer({ lists, prefixes: allPrefixes })
  writer.addQuads(subset.getQuads(null, null, null, null))

  return new Promise((resolve, reject) => {
    writer.end((error: any, result: any) => {
      // if (error) reject(error)
      if (result) {
        const outputPath = normalize(`${folder}/${relativePath}`) + '.ttl'
        const dir = dirname('./' + outputPath)
        ensureDirSync(dir)
        // Deno.writeTextFileSync('./' + outputPath, result)
        mutationSkipList.delete(relativePath)
      }
    })
  })
}