# Flatty, a flat file triple store

Flatty is a wrapper around a triple store. 
You can give a N3 Store or a URL to a Jena Endpoint.

It provides the following features:

- Nothing, I started from fresh

TODO:

- Test performance of SerializedN3Store
- Sync back Sparql updates to disk
- Make possible to use Apache Jena
- Make events trigger after submitting to Comunica
- File sync: edit turtle on disk and see that reflected in the in-memory store
- Middleware functionality: You can change the query and / or the outcome
- Provides __query()__ method from Comunica with some TypeScript typings
- WebSockets PubSub: Subscribe to query events
- Boot with a serialized N3 store instead of indexing when starting
