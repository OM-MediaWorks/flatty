# Flatty

Flatty is a wrapper around a triple store. It is built for Deno.

It provides the following features:

- You can use an N3 Store or a URL to a SPARQL Endpoint.
- Middlewares: 
  - EnforceShacl, enforce shacl shapes on INSERT DATA queries
  - Events, dispatches events on Flatty
    - file
    - file:insert
    - file:remove
    - before:query:SELECT
    - after:query:SELECT
    - before:query:INSERT
    - after:query:INSERT
    - websocket:opened
    - websocket:closed
  - Execute, Executes the query and nicely formats it
  - ForceGraph, When inserting data enforces a named graph
  - LoadGraphs, Loads turtle files from disk when Flatty starts
  - Prefixes, Loads prefixes
  - Subscribe, Subscribe to queries and get notified when the contents change
  - WatchDisk, Watch the disk for changes and apply them to the in memory N3 store
  - Websockets, Subscribe to events from the browser
  - WriteGraphs, When data is updated write back to the disk in turtle format  
- query() method from Comunica with TypeScript typings

TODO:

- Test performance of SerializedN3Store
- Rewrites query to always have a graph, started
- Revisions?