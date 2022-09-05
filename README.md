# Flatty, a flat file triple store

Flatty is a wrapper around the N3 store. 

It provides the following features:

- File sync: edit turtle on disk and see that reflected in the in-memory store
- Middleware functionality: You can change the query and / or the outcome
- Provides __query()__ method from Comunica with some TypeScript typings
- WebSockets PubSub: Subscribe to query events
- Boot with a serialized N3 store instead of indexing when starting

TODO:

- Test performance of SerializedN3Store
- Sync back Sparql updates to disk