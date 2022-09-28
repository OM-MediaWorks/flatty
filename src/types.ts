import { Store, JsonLdContextNormalized } from './deps.ts'
import { Flatty } from './Flatty.ts'

export type Options = {
  store?: Store,
  middlewares?: {
    [key: string]: Middleware
  }
}

export interface Middleware {
  dependencies?: Array<Middleware>
  init? (flatty: Flatty): Promise<void> | void
  stop? (): Promise<void> | void
  execute (context: QueryContext, next: Function): any
}

export type selectQuery = `${string}SELECT${string}`;
export type describeQuery = `${string}DESCRIBE${string}`;
export type insertQuery = `${string}INSERT DATA${string}`;

export type TermValue = {
  value: string,
  type: string,
  language?: string
}

export type DefaultBindings = 's' | 'p' | 'o'

export type QueryContext = {
  query: string,
  graphs: Set<string>,
  store: Store,
  engine: Engine
  results?: any,
  eventTarget: EventTarget,
  serialize: boolean
  parsedQuery: any,
  context: JsonLdContextNormalized
  simplify: boolean
}

export type Engine = {
  query: (query: string, options: { [key: string]: any }) => Promise<any>,
  resultToString: (data: any, type: string) => any
}

export type Binding<GivenBindings extends string> = { [key in GivenBindings]: TermValue }

export type BindingsResponse<GivenBindings extends string> = {
  head: {
    vars: Array<string>
  },
  results: {
    bindings: Array<Binding<GivenBindings>>
  }
}
