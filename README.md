# Flat File Triple Store

Flat File Triple Store is a wrapper around the N3 store. 

It provides the folloing features:

- File sync: edit turtle on disk and see that reflected in the in-memory store
- Middleware functionality: You can change the query and / or the outcome
- Provides __query()__ method from Comunica with some TypeScript typings
- WebSockets PubSub: Subscribe to query events

Future:

- Fast boot with a serialized N3 store instead of indexing when starting
