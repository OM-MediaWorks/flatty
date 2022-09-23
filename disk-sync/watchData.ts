import { ensureDir, expandGlob } from '../deps.ts'
import { addTurtleFileToStore, deleteGraphFromStore, getGraphUriByPath } from './addTurtleFileToStore.ts'
import { Store } from '../deps.ts'
import { normalize } from '../deps.ts'
import { mutationSkipList } from '../helpers/mutationSkipList.ts'

export const watchData = async (store: Store, base: string, rootFolder: string, eventTarget: EventTarget) => {

  const toRelativePath = (path: string) => {
    const normalizedPath = normalize(path)

    return normalizedPath
    .replace(Deno.cwd(), '')
    .replace(rootFolder.replace('./', '/'), '')
  }

  const dispatchEvent = (path: string, type: string) => {
    eventTarget.dispatchEvent(new CustomEvent('file', { detail: { path, type } }))
    eventTarget.dispatchEvent(new CustomEvent(`file.${type}`, { detail: { path } }))
  }

  await ensureDir(rootFolder)

  for await (const file of expandGlob(`${rootFolder}/**/*.ttl`)) {
    const path = toRelativePath(file.path)
    await addTurtleFileToStore(store, base, file.path)
    dispatchEvent(path, 'indexed')
  }

  const watcher = Deno.watchFs(rootFolder)
  
  ;(async () => {
    for await (const event of watcher) {
      for (const absolutePath of event.paths) {
        const path = toRelativePath(absolutePath)

        if (mutationSkipList.has(path)) continue

        if (['modify'].includes(event.kind)) {
          await addTurtleFileToStore(store, base, absolutePath)
          dispatchEvent(path, 'modify')
        }
  
        if (['remove'].includes(event.kind)) {
          const graphUri = getGraphUriByPath(path, base)  
          deleteGraphFromStore(store, graphUri)
          dispatchEvent(path, 'deleted')
        }
      }
    }    
  })()

  return watcher
}