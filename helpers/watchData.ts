import { ensureDir, expandGlob } from 'std/fs/mod.ts'
import { addTurtleFileToStore, deleteGraphFromStore, getGraphUriByPath } from './addTurtleFileToStore.ts'
import { Store } from 'n3'
import { dirname, fromFileUrl, normalize } from 'std/path/mod.ts'
import { mutationSkipList } from './mutationSkipList.ts'

export const watchData = async (store: Store, base: string, rootFolder: string, eventTarget: EventTarget) => {

  const toRelativePath = (path: string) => {
    const normalizedPath = normalize(path)
    const projectRoot = dirname(fromFileUrl(Deno.mainModule))
    return normalizedPath
    .replace(projectRoot, '')
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