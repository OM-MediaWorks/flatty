import { ensureDir, expandGlob } from 'https://deno.land/std@0.152.0/fs/mod.ts'
import { addTurtleFileToStore, deleteGraphFromStore, getGraphUriByPath } from './addTurtleFileToStore.ts'
import { Store } from 'https://cdn.skypack.dev/n3'

export const watchData = async (store: Store, base: string, rootFolder: string) => {
  await ensureDir(rootFolder)

  for await (const file of expandGlob(`${rootFolder}/**/*.ttl`)) {
    await addTurtleFileToStore(store, base, file.path)
  }

  const watcher = Deno.watchFs(rootFolder)
  
  ;(async () => {
    for await (const event of watcher) {
      for (const path of event.paths) {
        if (['modify'].includes(event.kind)) {
          await addTurtleFileToStore(store, base, path)
        }
  
        if (['remove'].includes(event.kind)) {
          const graphUri = getGraphUriByPath(path, base)  
          deleteGraphFromStore(store, graphUri)
        }
      }
    }    
  })()
}