import { Options, selectQuery, describeQuery, BindingsResponse, DefaultBindings, QueryContext, Engine } from './types.ts'
import { Quad, Store } from 'n3'
import { execute } from './middlewares/execute.ts'
import { events } from './middlewares/events.ts'
import { websockets } from './websockets.ts'
import { SerializedN3Store } from './SerializedN3Store.ts'

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
  #websockets
  /** @ts-ignore */
  #watcher: Deno.FsWatcher

  constructor (options: Options) {
    super()

    this.#options = options
    this.#engine = new QueryEngine()
    this.#store = new SerializedN3Store()
    this.#middlewares = [events]
    if (options.middlewares) this.#middlewares.push(...options.middlewares)
    this.#middlewares.push(execute)
    if (!this.#options.baseURI) this.#options.baseURI = 'http://example.com'

    this.#websockets = websockets(this, this.#options.websocketsPort ?? 8007)

    /* @ts-ignore */
    return watchData(this.#store, this.#options.baseURI!, this.#options.folder, this)
    .then((watcher) => {
      this.#watcher = watcher
      return this
    })
  }
 
  close () {
    this.#watcher.close()
    return this.#websockets.close()
  }

  async query (query: describeQuery, serialize: boolean): Promise<string>;
  async query (query: selectQuery, serialize: boolean): Promise<string>;

  async query (query: describeQuery, serialize?: boolean): Promise<Array<Quad>>;
  async query <Bindings extends string = DefaultBindings>(query: selectQuery, serialize?: boolean): Promise<BindingsResponse<Bindings>>;

  async query (query: describeQuery | selectQuery, serialize: boolean = false) {
    query = query.startsWith('DESCRIBE') ? query as describeQuery : query as selectQuery
    const context: QueryContext = await { query, store: this.#store, engine: this.#engine, eventTarget: this, serialize }

    let chain: any 
    for (const middleware of [...this.#middlewares].reverse()) {
      const previousPointer = chain
      chain = () => middleware(context, previousPointer ? previousPointer : () => null)
    }

    return chain()
  }
}