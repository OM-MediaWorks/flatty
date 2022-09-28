import { Options, selectQuery, describeQuery, BindingsResponse, DefaultBindings, QueryContext, Engine, insertQuery } from './types.ts'
import { Quad, Store } from './deps.ts'
import { execute } from './middlewares/execute.ts'
import { events } from './middlewares/events.ts'
import { prefixes } from './middlewares/prefixes.ts'
import { ensureGraph } from './middlewares/ensureGraph.ts'
import { diskSync } from './middlewares/diskSync.ts'
import { websockets } from './websockets/websockets.ts'
import { SerializedN3Store } from './serialized-store/SerializedN3Store.ts'
import { SparqlParser } from './deps.ts'
import { watchData } from './disk-sync/watchData.ts'

/** @ts-ignore */
import Comunica from './vendor/comunica-browser.js'
/** @ts-ignore */
const { QueryEngine } = Comunica

export class Flatty extends EventTarget {

  #middlewares: Array<(context: QueryContext, next: any) => Promise<void>> = []
  #options: Options
  #engine: Engine
  #store: Store
  #websockets: any
  /** @ts-ignore */
  #watcher: Deno.FsWatcher

  constructor (options: Options) {
    super()

    this.#options = options
    this.#engine = new QueryEngine()
    if (!this.#options.baseURI) this.#options.baseURI = 'http://example.com'
    this.#store = this.#options.store ?? new SerializedN3Store()
    this.#middlewares = [ensureGraph, events, prefixes, diskSync]
    if (options.middlewares) this.#middlewares.push(...options.middlewares)
    this.#middlewares.push(execute)

    if (this.#options.websocketsPort !== false) {
      this.#websockets = websockets(this, this.#options.websocketsPort ?? 8007)
    }

    if (this.#options.folder) {
      /* @ts-ignore */
      return watchData(this.#store, this.#options.baseURI!, this.#options.folder, this)
      .then((watcher) => {
        this.#watcher = watcher
        return this
      })
    }
  }
 
  close () {
    this.#watcher?.close()
    return this.#websockets?.close()
  }

  async query (query: insertQuery): Promise<void>;
  async query (query: describeQuery, serialize: boolean): Promise<string>;
  async query (query: selectQuery, serialize: boolean): Promise<string>;

  async query (query: describeQuery, serialize?: boolean): Promise<Array<Quad>>;
  async query <Bindings extends string = DefaultBindings>(query: selectQuery, serialize?: boolean): Promise<BindingsResponse<Bindings>>;

  async query (query: describeQuery | selectQuery | insertQuery, serialize = false) {
    const parser = new SparqlParser()
    const context: QueryContext = await { 
      base: this.#options.baseURI!, 
      query, 
      store: this.#store, 
      engine: this.#engine, 
      eventTarget: this, 
      serialize, 
      parsedQuery: parser.parse(query),
      folder: this.#options.folder ? this.#options.folder : undefined
    }

    let chain: any 
    for (const middleware of [...this.#middlewares].reverse()) {
      const previousPointer = chain
      chain = () => middleware(context, previousPointer ? previousPointer : () => null)
    }

    return chain()
  }
}