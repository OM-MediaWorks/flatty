import { Options, selectQuery, describeQuery, BindingsResponse, DefaultBindings, QueryContext, Engine, insertQuery, Middleware, Binding } from './types.ts'
import { Quad, Store } from './deps.ts'
import { SerializedN3Store } from './serialized-store/SerializedN3Store.ts'
import { SparqlParser } from './deps.ts'
import { QueryEngine } from './vendor/comunica-browser.js'

// Default Middlewares
import { Execute } from './middlewares/Execute/Execute.ts'
import { Events } from './middlewares/Events/Events.ts'
import { Prefixes } from './middlewares/Prefixes/Prefixes.ts'

export class Flatty extends EventTarget {

  #middlewares: { [key: string]: Middleware } = {}
  #options: Options
  #engine: Engine
  #store: Store

  constructor (options?: Options) {
    super()

    this.#options = options ?? {}
    this.#engine = new QueryEngine()
    this.#store = this.#options.store ?? new SerializedN3Store()
    
    this.#middlewares = { 
      // ...options.middlewares, 
      events: new Events(),
      prefixes: new Prefixes(),
      execute: new Execute(),
    }

    // To start Flatty you have to resolve the Promise it gives from the constructor:
    // const db = await new Flatty({ ... })

    /** @ts-ignore */
    return this.init().then(() => this)
  }

  async init () {
    for (const middleware of Object.values(this.#middlewares)) {
      if (middleware.init) 
        await middleware.init(this) 
    }
  }
 
  async stop () {
    for (const middleware of Object.values(this.#middlewares)) {
      if (middleware.stop) 
        await middleware.stop() 
    }
  }

  async query (query: insertQuery): Promise<void>;
  async query (query: selectQuery, serialize: true, simplify?: boolean): Promise<string>;
  async query <GivenBindings extends string = DefaultBindings>(query: selectQuery, serialize: true, simplify?: boolean): Promise<string>;
  async query (query: describeQuery, serialize: true): Promise<string>;

  async query (query: describeQuery, serialize?: false): Promise<Array<Quad>>;
  async query <GivenBindings extends string = DefaultBindings>(query: selectQuery, serialize?: false, simplify?: true): Promise<Array<Binding<GivenBindings>>>;
  async query <GivenBindings extends string = DefaultBindings>(query: selectQuery, serialize?: false, simplify?: false): Promise<BindingsResponse<GivenBindings>>;
 
  query (query: describeQuery | selectQuery | insertQuery, serialize = false, simplify = true) {
    const parser = new SparqlParser()
    const context: QueryContext = { 
      query, 
      store: this.#store, 
      engine: this.#engine, 
      eventTarget: this, 
      serialize,
      simplify,
      parsedQuery: parser.parse(query)
    }

    let chain: any 
    for (const middleware of Object.values(this.#middlewares).reverse()) {
      const previousPointer = chain
      chain = () => middleware.execute(context, previousPointer ? previousPointer : () => null)
    }

    return chain()
  }
}