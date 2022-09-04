import { Options, selectQuery, describeQuery, TermValue, DefaultBindings, QueryContext, Engine } from './types.ts'
import { Store } from 'https://cdn.skypack.dev/n3'
import { execute } from './middlewares/execute.ts'
import { events } from './middlewares/events.ts'

/** @ts-ignore */
import Comunica from './vendor/comunica-browser.js'
import { watchData } from './helpers/watchData.ts'
/** @ts-ignore */
const { QueryEngine } = Comunica

export class FlatFileTripleStore extends EventTarget{

  #middlewares: Array<(context: QueryContext, next: any) => Promise<void>> = []
  #options: Options
  #engine: Engine
  #store: Store

  constructor (options: Options) {
    super()

    this.#options = options
    this.#engine = new QueryEngine()
    this.#store = new Store()
    this.#middlewares = [events]
    if (options.middlewares) this.#middlewares.push(...options.middlewares)
    this.#middlewares.push(execute)

    /* @ts-ignore */
    return this.initiate().then(() => {
      return this
    })
  }

  async initiate () {
    await watchData(this.#store, this.#options.baseURI, this.#options.rootFolder)
  }
  
  async query (query: describeQuery): Promise<string>;
  async query <Bindings extends string = DefaultBindings>(query: selectQuery): Promise<Array<{ [key in Bindings]: TermValue }>>;
  async query (query: describeQuery | selectQuery) {
    query = query.startsWith('DESCRIBE') ? query as describeQuery : query as selectQuery
    const context = await { query, store: this.#store, engine: this.#engine }

    let pointer: any 
    for (const middleware of [...this.#middlewares, pointer].reverse()) {
      const previousPointer = pointer
      pointer = () => middleware(context, previousPointer ? previousPointer : () => null)
    }

    return pointer()
  }
}