# Flatty

Flatty is a wrapper around a triple store. 

It is built for Deno and the core and most middlewares will also work in the browser.
It is quite flexible in what it can do because all functionality is built with middlewares.

The main purpose of it is a in-memory store that syncs back graphs to the disk in turtle format.
When you would edit these turtle files the result would be written back to the in-memory store.
This makes development very easy. Your frontend could even subscribe to events and refresh when needed.

When going to production you can always switch the source argument to a database such as Apache Jena.

## Features

It provides the following features:

- You can use an N3 Store or an URL to a SPARQL Endpoint.
- __query()__ method from Comunica with TypeScript typings
- Middlewares: 
  - __EnforceShacl__, enforce SHACL shapes on INSERT DATA queries. You provide a callback which returns the SHACL shape as an N3 store.
  - __Events__, dispatches events on Flatty
    - file, file:insert, file:remove, before:query:SELECT, after:query:SELECT, before:query:INSERT, after:query:INSERT, websocket:opened, websocket:closed
  - __Execute__, Executes the query and nicely outputs it with Typescript typings, it can gather multiple sources via a callback
  - __ForceGraph__, When inserting data enforces a named graph
  - __LoadGraphs__, Loads turtle files from disk when Flatty starts
  - __Prefixes__, Loads prefixes
  - __Subscribe__, Subscribe to queries and get notified when the contents change
  - __WatchDisk__, Watch the disk for changes and apply them to the in memory N3 store
  - __Websockets__, Subscribe to events from the browser
  - __WriteGraphs__, When data is updated write back to the disk in turtle format  
  - Or write your own...

## Usage

```TypeScript

const flatty = await new Flatty()

const flatty = await new Flatty({
  source: 'https://dbpedia.com/sparql'
  // Not very useful because most middlewares are about 
  // the functionality of writing and 
  // the interaction between reading and writing.
  //
  // In this case you can just use Comunica directly.
})

const flatty = await new Flatty({
  middlewares: {
    Execute: new Execute(),
    // All the middlewares that you want to use.
  }
})

const flatty = await new Flatty({
  middlewares: createMiddlewares('./data', {
    // This makes sure documents withs https://example.com/Person
    // are saved into the ./data/people folder.
    'https://example.com/Person': 'people'
  })
})


```


### TODO

- Test performance of SerializedN3Store
- Rewrites query to always have a graph, started
- Revisions?