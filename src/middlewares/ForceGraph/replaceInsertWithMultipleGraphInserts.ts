import { NamedNode } from '../../deps.ts'

export const replaceInsertWithMultipleGraphInserts = (value: any, insert: any, subjects: Set<string>) => {
  const insertIndex = value.indexOf(insert)
  value.splice(insertIndex, 1)

  for (const subject of subjects) {
    const newInsert = JSON.parse(JSON.stringify(insert))
    newInsert.type = 'graph'
    newInsert.name = new NamedNode(subject)
    newInsert.triples = insert.triples.filter((triples: any) => triples.subject?.value === subject)
    value.push(newInsert)
  } 
}
