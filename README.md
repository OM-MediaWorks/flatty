# Flatty

Flatty is a wrapper around a triple store. It is built for Deno and some middlewares will work in the browser.

It provides the following features:

- You can use an N3 Store or a URL to a SPARQL Endpoint.
- Middlewares: 
  - __EnforceShacl__, enforce SHACL shapes on INSERT DATA queries
  - __Events__, dispatches events on Flatty
    - file, file:insert, file:remove, before:query:SELECT, after:query:SELECT, before:query:INSERT, after:query:INSERT, websocket:opened, websocket:closed
  - __Execute__, Executes the query and nicely outputs it with Typescript typings
  - __ForceGraph__, When inserting data enforces a named graph
  - __LoadGraphs__, Loads turtle files from disk when Flatty starts
  - __Prefixes__, Loads prefixes
  - __Subscribe__, Subscribe to queries and get notified when the contents change
  - __WatchDisk__, Watch the disk for changes and apply them to the in memory N3 store
  - __Websockets__, Subscribe to events from the browser
  - __WriteGraphs__, When data is updated write back to the disk in turtle format  
  - Or write your own...
- __query()__ method from Comunica with TypeScript typings

TODO:

- Test performance of SerializedN3Store
- Rewrites query to always have a graph, started
- Revisions?