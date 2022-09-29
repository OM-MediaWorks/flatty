# Flatty

Flatty is a wrapper around a triple store. It is built for Deno.

It provides the following features:

- Flatty provides addEventListener, the following events are available:
  - file
  - file:insert
  - file:remove
  - before:query:SELECT
  - after:query:SELECT
  - before:query:INSERT
  - after:query:INSERT
  - websocket:opened
  - websocket:closed
- Middlewares: Change queries, results or start processes
- query() method from Comunica with TypeScript typings
- You can give a N3 Store or a URL to a SPARQL Endpoint.
- N3Store that can be started with cache
- File sync: edit turtle on disk and see that reflected in the in-memory store
- Sparql updates to disk as turtle files
- WebSockets PubSub: Subscribe to query result changes

TODO:

- Test performance of SerializedN3Store
- Rewrites query to always have a graph, started
- Revisions?