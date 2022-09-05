import { Store, StoreOptions, BaseQuad, Quad } from 'n3'
import * as RDF from "https://esm.sh/v93/@types/rdf-js@4.0.2/rdf-js.d.ts";

export type SerializedN3StoreOptions = StoreOptions & {
  snapshot: string
}

export class SerializedN3Store
<Q_RDF extends RDF.BaseQuad = RDF.Quad, Q_N3 extends BaseQuad = Quad, OutQuad extends RDF.BaseQuad = RDF.Quad, InQuad extends RDF.BaseQuad = RDF.Quad>
extends Store implements RDF.Store<Q_RDF>, RDF.DatasetCore<OutQuad, InQuad> {
  constructor (triples?: Q_RDF[], options?: SerializedN3StoreOptions) {
    super(triples, options)
    if (options) {
      const snapshot = JSON.parse(options.snapshot)
      const keysToSkip = ['_factory']
      for (const [key, value] of Object.entries(snapshot)) {
        /** @ts-ignore */
        if (!keysToSkip.includes(key)) this[key] = value
      }
    }
  }

  serialize () {
    const snapshot = JSON.stringify(this)
    return snapshot
  }
}