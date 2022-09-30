import { QueryContext } from '../../types.ts'
import { Middleware } from '../../types.ts'
import { Flatty } from '../../Flatty.ts'
import { Sha512 } from '../../deps.ts'
import { fire } from '../../helpers/fire.ts'

export class Subscribe implements Middleware {

  #flatty: Flatty

  constructor () {
    this.#flatty = null!
  }

  init (flatty: Flatty) {
    this.#flatty = flatty
    if (!flatty.middlewares.Websockets) throw new Error('The middleware Subscribe requires the Websockets middleware.')
  }

  execute (context: QueryContext, next: Function) {
    return next()
  }

  async subscribe (query: string, callback: () => void) {
    const originalHash = new Sha512()
    /** @ts-ignore */
    const string = await this.#flatty.query(query, true, false, {})
    originalHash.update(string)

    const eventSubscriber = async () => {
      const compareHash = new Sha512()

      /** @ts-ignore */
      const string = await this.#flatty.query(query, true, false, {})
      compareHash.update(string)

      if (originalHash.toString() !== compareHash.toString()) {
        this.#flatty.removeEventListener('after:query', eventSubscriber)
        callback()
      }
    }

    this.#flatty.addEventListener('after:query:update', eventSubscriber)
    fire(['subscribed', `subscribed:${originalHash.toString()}`], this.#flatty, {})
  }
}