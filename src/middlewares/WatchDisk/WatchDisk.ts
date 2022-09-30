import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { Store, normalize } from '../../deps.ts'
import { addTurtleFileToStore } from '../../helpers/addTurtleFileToStore.ts'
import { deleteGraphFromStore } from '../../helpers/deleteGraphFromStore.ts'
import { fileToGraphsMapping } from '../../helpers/fileToGraphsMapping.ts'
import { fire } from '../../helpers/fire.ts'
import { mutationSkipList } from '../../helpers/mutationSkipList.ts'

export class WatchDisk implements Middleware {

  #folder: string
  #watcher: Deno.FsWatcher

  constructor (folder: string) {
    this.#folder = folder
    this.#watcher = Deno.watchFs(normalize(this.#folder))
  }

  init (flatty: Flatty) {
    if (!(flatty.store instanceof Store)) return

    ;(async () => {
      for await (const event of this.#watcher) {
        for (const path of event.paths) {

          if (['modify'].includes(event.kind)) {
            if (!mutationSkipList.has(path)) {
              if (await addTurtleFileToStore(flatty.store, path))
                fire(['file', 'file:insert'], flatty, { path })  
            }
          }
    
          if (['remove'].includes(event.kind)) {
            const graphs = fileToGraphsMapping.get(path)
            for (const graph of graphs) {
              if (!mutationSkipList.has(path)) {
                deleteGraphFromStore(flatty.store, graph)
                fire(['file', 'file:remove'], flatty, { path })  
              }
            }
          }
        }
      }    
    })()

  }

  stop () {
    this.#watcher?.close()
  }

  execute (_context: QueryContext, next: Function) {
    return next()
  }
} 
