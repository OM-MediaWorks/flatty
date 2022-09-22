import { SerializedN3Store } from './SerializedN3Store.ts'
import { Term, Quad, Store } from 'n3'
import { SyncGraphToDisk } from './helpers/SyncGraphToDisk.ts'

function addQuad (quad: Quad): void;
function addQuad (subject: Term, predicate: Term, object: Term, graph: Term): void;
function addQuad (this: Store, ...args: Array<any>) {
  const graph = args[0].termType === 'Quad' ? args[0].graph : args[3]
  quadsInTransaction.add(graph.value)

  /** @ts-ignore */
  return this.addQuad(...args)
}

const state: { 
  inTransaction: boolean
} = {
  inTransaction: false
}

const quadsInTransaction: Set<string> = new Set()

/**
 * TODO Migrate to be standard events.
 */
export const StoreProxy = (store: SerializedN3Store, eventTarget: EventTarget, base: string, folder: string) => {

  return new Proxy(store, {
    set (target, property, value, receiver) {

      if (property.toString() === 'inTransaction') {
        state.inTransaction = value

        if (!value) {
          if (quadsInTransaction.size) {
            for (const graph of quadsInTransaction) SyncGraphToDisk(store, graph, base, folder)
          }
          quadsInTransaction.clear()
        }

        return true
      }

      if (property.toString() in Object.keys(state)) {
        return state[property as keyof typeof state] = value
      }

      return Reflect.set(target, property, value, receiver)
    },

    get (target, property, receiver) {
      // if (prop.toString()[0] !== '_') {
      //   console.log(prop)
      // }

      if (property.toString() in Object.keys(state)) {
        return state[property as keyof typeof state]
      }

      if (property.toString() === 'addQuad') {
        return addQuad.bind(store)
      }

      return Reflect.get(target, property, receiver)
    }
  })
}