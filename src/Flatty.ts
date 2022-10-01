import { Quad, Store, JsonLdContextNormalized } from './deps.ts'
import { SerializedN3Store } from './serialized-store/SerializedN3Store.ts'
import { SparqlParser } from './deps.ts'
import { QueryEngine } from './deps.ts'
import { createMiddlewares } from './helpers/createMiddlewares.ts'
import { Subscribe } from './middlewares/Subscribe/Subscribe.ts'
import { 
  Options, 
  query, 
  selectQuery, 
  describeQuery, 
  constructQuery, 
  BindingsResponse, 
  DefaultBindings, 
  QueryContext, 
  Engine, 
  insertQuery, 
  Middleware, 
  Binding 
} from './types.ts'

export class Flatty extends EventTarget {

  middlewares: { [key: string]: Middleware } = {}
  #options: Options
  #engine: Engine
  store: Store

  constructor (options?: Options) {
    super()

    this.#options = options ?? {}
    this.#engine = new QueryEngine()
    this.store = this.#options.store ?? new SerializedN3Store()
    
    if (!this.#options.websocketsPort) this.#options.websocketsPort = 8001

    if (!this.#options.middlewares && (!this.#options.folder || !this.#options.typeMapping)) 
      throw new Error('A folder and typeMapping or middlewares are required.')

    this.middlewares = this.#options.middlewares ?? 
      createMiddlewares(this.#options.folder!, this.#options.typeMapping!, this.#options.websocketsPort)

    // To start Flatty you have to resolve the Promise it gives from the constructor:
    // const db = await new Flatty({ ... })

    /** @ts-ignore */
    return this.init().then(() => this)
  }

  async init () {
    for (const middleware of Object.values(this.middlewares)) {
      if (middleware.init) 
        await middleware.init(this) 
    }
  }
 
  async stop () {
    for (const middleware of Object.values(this.middlewares)) {
      if (middleware.stop) 
        await middleware.stop() 
    }
  }

  async query (query: insertQuery): Promise<void>;
  async query (query: selectQuery, serialize: true, simplify?: boolean, additionalContext?: { [key: string]: any }): Promise<string>;
  async query (query: constructQuery, serialize: true | string, simplify?: boolean, additionalContext?: { [key: string]: any }): Promise<string>;
  async query (query: constructQuery): Promise<Array<Quad>>;
  async query (query: describeQuery, serialize?: false, simplify?: boolean, additionalContext?: { [key: string]: any }): Promise<Array<Quad>>;
  async query (query: describeQuery, serialize: true, simplify?: boolean, additionalContext?: { [key: string]: any }): Promise<string>;

  async query <GivenBindings extends string = DefaultBindings>
    (query: selectQuery, serialize: true, simplify?: boolean, additionalContext?: { [key: string]: any }): Promise<string>;
  async query <GivenBindings extends string = DefaultBindings>
    (query: selectQuery, serialize?: false, simplify?: true, additionalContext?: { [key: string]: any }): Promise<Array<Binding<GivenBindings>>>;
  async query <GivenBindings extends string = DefaultBindings>
    (query: selectQuery, serialize?: false, simplify?: false, additionalContext?: { [key: string]: any }): Promise<BindingsResponse<GivenBindings>>;
 
  query (query: query, serialize: boolean | string = false, simplify = true, additionalContext: { [key: string]: any } = {}) {
    const parser = new SparqlParser()
    const context: QueryContext = { 
      query, 
      source: this.store, 
      engine: this.#engine, 
      eventTarget: this, 
      serialize,
      simplify,
      context: new JsonLdContextNormalized({}),
      graphs: new Set(),
      parsedQuery: parser.parse(query),
      ...additionalContext
    }

    let chain: any 
    for (const middleware of Object.values(this.middlewares).reverse()) {
      const previousPointer = chain
      chain = () => middleware.execute(context, previousPointer ? previousPointer : () => null)
    }

    return chain()
  }

  subscribe(query: string, callback: () => void) {
    if (this.middlewares.Subscribe) {
      return (this.middlewares.Subscribe as Subscribe).subscribe(query, callback)
    }
    else {
      throw new Error('Missing Subscribe middleware')
    }
  }
}