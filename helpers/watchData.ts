import { ensureDir, expandGlob } from 'std/fs/mod.ts'
import { addTurtleFileToStore, deleteGraphFromStore, getGraphUriByPath } from './addTurtleFileToStore.ts'
import { Store } from 'n3'

export const watchData = async (store: Store, base: string, rootFolder: string, eventTarget: EventTarget) => {

  const dispatchEvent = (path: string, type: string) => {
    eventTarget.dispatchEvent(new CustomEvent('file', { detail: { path, type } }))
    eventTarget.dispatchEvent(new CustomEvent(`file.${type}`, { detail: { path } }))
  }

  await ensureDir(rootFolder)

  for await (const file of expandGlob(`${rootFolder}/**/*.ttl`)) {
    await addTurtleFileToStore(store, base, file.path)
    dispatchEvent(file.path, 'indexed')
  }

  const watcher = Deno.watchFs(rootFolder)
  
  ;(async () => {
    for await (const event of watcher) {
      for (const path of event.paths) {
        if (['modify'].includes(event.kind)) {
          await addTurtleFileToStore(store, base, path)
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