import { Options, selectQuery, describeQuery, BindingsResponse, DefaultBindings, QueryContext, Engine, insertQuery, EnhancedStore } from './types.ts'
import { Quad } from 'n3'
import { execute } from './middlewares/execute.ts'
import { events } from './middlewares/events.ts'
import { prefixes } from './middlewares/prefixes.ts'
import { websockets } from './websockets.ts'
import { SerializedN3Store } from './SerializedN3Store.ts'
import { StoreProxy } from './StoreProxy.ts'
import { Parser } from 'sparqljs'

/** @ts-ignore */
import Comunica from './vendor/comunica-browser.js'
import { watchData } from './helpers/watchData.ts'
/** @ts-ignore */
const { QueryEngine } = Comunica

export class Flatty extends EventTarget {

  #middlewares: Array<(context: QueryContext, next: any) => Promise<void>> = []
  #options: Options
  #engine: Engine
  #store: EnhancedStore
  #websockets
  /** @ts-ignore */
  #watcher: Deno.FsWatcher

  constructor (options: Options) {
    super()

    this.#options = options
    this.#engine = new QueryEngine()
    if (!this.#options.baseURI) this.#options.baseURI = 'http://example.com'
    this.#store = StoreProxy(new SerializedN3Store(), this, this.#options.baseURI, this.#options.folder) as unknown as EnhancedStore
    this.#middlewares = [events, prefixes]
    if (options.middlewares) this.#middlewares.push(...options.middlewares)
    this.#middlewares.push(execute)

    if (this.#options.websocketsPort !== false) {
      this.#websockets = websockets(this, this.#options.websocketsPort ?? 8007)
    }

    /* @ts-ignore */
    return watchData(this.#store, this.#options.baseURI!, this.#options.folder, this)
    .then((watcher) => {
      this.#watcher = watcher
      return this
    })
  }
 
  close () {
    this.#watcher.close()
    return this.#websockets?.close()
  }

  async query (query: insertQuery): Promise<void>;
  async query (query: describeQuery, serialize: boolean): Promise<string>;
  async query (query: selectQuery, serialize: boolean): Promise<string>;

  async query (query: describeQuery, serialize?: boolean): Promise<Array<Quad>>;
  async query <Bindings extends string = DefaultBindings>(query: selectQuery, serialize?: boolean): Promise<BindingsResponse<Bindings>>;

  async query (query: describeQuery | selectQuery | insertQuery, serialize: boolean = false) {
    const parser = new Parser()
    const context: QueryContext = await { query, store: this.#store, engine: this.#engine, eventTarget: this, serialize, parsedQuery: parser.parse(query) }

    this.#store.inTransaction = true

    let chain: any 
    for (const middleware of [...this.#middlewares].reverse()) {
      const previousPointer = chain
      chain = () => middleware(context, previousPointer ? previousPointer : () => null)
    }

    return chain()
  }
}