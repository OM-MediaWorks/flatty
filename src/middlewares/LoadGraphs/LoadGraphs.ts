import { Flatty } from '../../Flatty.ts'
import { Middleware, QueryContext } from '../../types.ts'
import { expandGlob, ensureDir, Store } from '../../deps.ts'
import { addTurtleFileToStore } from '../../helpers/addTurtleFileToStore.ts'

export class LoadGraphs implements Middleware {

  #folder: string

  constructor (folder: string) {
    this.#folder = folder
  }

  async init (flatty: Flatty) {
    if (!(flatty.store instanceof Store)) return

    await ensureDir(this.#folder)

    for await (const file of expandGlob(`${this.#folder}/**/*.ttl`)) {
      await addTurtleFileToStore(flatty.store, file.path)
    }
  }

  execute (_context: QueryContext, next: Function) {
    return next()
  }
} 
