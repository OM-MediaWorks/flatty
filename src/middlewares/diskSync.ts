import { QueryContext } from '../types.ts'
import { SyncGraphToDisk } from '../disk-sync/SyncGraphToDisk.ts'

export const diskSync = (context: QueryContext, next: Function) => {
  if (context.parsedQuery.type === 'update') {
    const subjects = context.parsedQuery.updates.flatMap((update: any) => update.insert.flatMap((data: any) => data.triples.flatMap((triples: any) => triples.subject.value)))
    const subjectsSet: Set<string> = new Set(subjects)
    const graphs: Array<string> = [...subjectsSet.values()]

    for (const graph of graphs) {
      if (context.folder)
        SyncGraphToDisk(context.store, graph, context.base, context.folder)
    }
  }
  return next()
}