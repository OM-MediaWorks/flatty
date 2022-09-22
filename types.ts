import { Store } from 'n3'

export type Options = {
  baseURI?: string
  folder: string
  websocketsPort?: number | false,
  middlewares?: Array<(context: QueryContext, next: any) => Promise<void>>
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
  store: EnhancedStore
  engine: Engine
  results?: any,
  eventTarget: EventTarget,
  serialize: boolean
  parsedQuery: any
}

export type Engine = {
  query: (query: string, options: { [key: string]: any }) => Promise<any>,
  resultToString: (data: any, type: string) => any
}

export type BindingsResponse<Bindings extends string> = {
  head: {
    vars: Array<string>
  },
  results: {
    bindings: Array<{ [key in Bindings]: TermValue }>
  }
}

export type EnhancedStore = Store & { inTransaction: boolean }