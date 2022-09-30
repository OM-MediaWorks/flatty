import { assertEquals } from '../../deps.ts'
import { Flatty } from '../../Flatty.ts'
import { beforeAll, afterAll, it, describe } from '../../deps.ts'
import { testMiddlewares } from '../testMiddlewares.ts'
import { EnforceShacl } from './EnforceShacl.ts'
import { turtleToStore } from '../../helpers/turtleToStore.ts'

const personShape = `
PREFIX ex: <http://example.com/>
PREFIX sh: <http://www.w3.org/ns/shacl#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>

ex:PersonShape
	a sh:NodeShape ;
	sh:targetClass ex:Person ;
	sh:property [
		sh:path ex:givenName ;
		sh:minCount 1 ;
		sh:maxCount 1 ;
		sh:datatype xsd:string ;
	] ;
	sh:property [
		sh:path ex:familyName ;
		sh:datatype xsd:string ;
		sh:minCount 1 ;
		sh:maxCount 1 ;
	] ;
	sh:closed true ;
	sh:ignoredProperties ( rdf:type ) .
`

const shaclShapes: { [key: string]: string } = {
  'http://example.com/Person': personShape
}

describe('Middleware EnforeShacl', () => {
  let store: Flatty

  beforeAll(async () => {
    store = await new Flatty({
      middlewares: {
        ForceGraph: testMiddlewares.ForceGraph,
        EnforceShacl: new EnforceShacl({
          resolver: async (rdfClassIRI: string) => {
            if (shaclShapes[rdfClassIRI]) {
              const { store } = await turtleToStore(shaclShapes[rdfClassIRI])
              return store  
            }
          }
        }),
        Execute: testMiddlewares.Execute,
      }
    })
  })

  afterAll(async () => {
    await store.stop()
  })

  it('enforces shacl and throws when data does not validate', async () => {
    try {
      await store.query(`
        PREFIX ex: <http://example.com/>
        
        INSERT DATA {
          ex:book1 
              a               ex:Person ;
              ex:firstName    "John" ;
              ex:lastName     "Doo" .  
        }
      `)

      throw new Error('The above query should fail!')
    }
    catch (exception) {
      assertEquals(exception.message, 'The data did not validate against the SHACL shape for http://example.com/Person')
    }
  })

  it('enforces shacl and accepts when data does validate', async () => {
    await store.query(`
      PREFIX ex: <http://example.com/>
      
      INSERT DATA {
        ex:book1 
            a               ex:Person ;
            ex:givenName    "John" ;
            ex:familyName     "Doo" .  
      }
    `)

    const response = await store.query('SELECT * { <http://example.com/book1> ?p ?o }')
    assertEquals(response.length, 3)
  })

  it('throws when given a class it does not have a shape for and its not allowed', async () => {
    try {
      await store.query(`
      PREFIX ex: <http://example.com/>
      
      INSERT DATA {
        ex:book1 
            a               ex:FakePerson ;
            ex:givenName    "John" ;
            ex:familyName     "Doo" .  
      }
    `)
    }
    catch (exception) {
      assertEquals(exception.message, 'Missing SHACL Shape for http://example.com/FakePerson')
    }
  })

})

