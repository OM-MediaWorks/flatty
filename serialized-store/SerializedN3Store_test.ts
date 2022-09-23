import { assertEquals } from '../deps.ts'
import { it, describe } from '../deps.ts'
import { SerializedN3Store } from './SerializedN3Store.ts'
import { addTurtleFileToStore } from '../disk-sync/addTurtleFileToStore.ts'

describe('Serialized N3 Store', () => {
  it('starts with old state', async () => {
    const stateStore = new SerializedN3Store()
    await addTurtleFileToStore(stateStore, 'http://example.com', './test-data/daniel-beeke.ttl')
    const snapshot = stateStore.serialize()
    const store = new SerializedN3Store([], { snapshot })
    const quads = store.getQuads(null, null, null, null)
    assertEquals(quads.length, 14)
  })

})

