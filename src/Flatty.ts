import { Options, selectQuery, describeQuery, BindingsResponse, DefaultBindings, QueryContext, Engine, insertQuery, Middleware } from './types.ts'
import { Quad, Store } from './deps.ts'
import { Execute } from './middlewares/execute.ts'
import { SerializedN3Store } from './serialized-store/SerializedN3Store.ts'
import { SparqlParser } from './deps.ts'
import { QueryEngine } from './vendor/comunica-browser.js'

export class Flatty extends EventTarget {

  #middlewares: { [key: string]: Middleware } = {}
  #options: Options
  #engine: Engine
  #store: Store

  constructor (options: Options) {
    super()

    this.#options = options
    this.#engine = new QueryEngine()
    this.#store = this.#options.store ?? new SerializedN3Store()
    
    this.#middlewares = { 
      // ...options.middlewares, 
      execute: new Execute()
    }

    // To start Flatty you have to resolve the Promise it gives from the constructor:
    // const db = await new Flatty({ ... })

    /** @ts-ignore */
    return Promise.all(Object.values(this.#middlewares).map(middleware => {
      return middleware.init ? middleware.init() : Promise.resolve()
    })).then(() => this)
  }
 
  async close () {
    for (const middleware of Object.values(this.#middlewares)) {
      if (middleware.stop) 
        await middleware.stop() 
    }
  }

  async query (query: insertQuery): Promise<void>;
  async query (query: describeQuery, serialize: boolean): Promise<string>;
  async query (query: selectQuery, serialize: boolean): Promise<string>;

  async query (query: describeQuery, serialize?: boolean): Promise<Array<Quad>>;
  async query <Bindings extends string = DefaultBindings>(query: selectQuery, serialize?: boolean): Promise<BindingsResponse<Bindings>>;

  query (query: describeQuery | selectQuery | insertQuery, serialize = false) {
    const parser = new SparqlParser()
    const context: QueryContext = { 
      query, 
      store: this.#store, 
      engine: this.#engine, 
      eventTarget: this, 
      serialize,
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