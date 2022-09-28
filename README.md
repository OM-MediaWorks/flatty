# Flatty

Flatty is a wrapper around a triple store. It is built for Deno.

It provides the following features:

- Events after queries
- Middleware functionality: You can change the query and / or the outcome
- Boot with a serialized N3 store instead of indexing when starting
- Provides __query()__ method from Comunica with TypeScript typings
- You can give a N3 Store or a URL to a SPARQL Endpoint.

TODO:

- Test performance of SerializedN3Store
- Rewrites query to always have a graph
- Sync back Sparql updates to disk
- File sync: edit turtle on disk and see that reflected in the in-memory store
- WebSockets PubSub: Subscribe to query result changes