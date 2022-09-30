import { Execute } from '../middlewares/Execute/Execute.ts'
import { Events } from '../middlewares/Events/Events.ts'
import { Prefixes } from '../middlewares/Prefixes/Prefixes.ts'
import { ForceGraph } from '../middlewares/ForceGraph/ForceGraph.ts'
import { WatchDisk } from '../middlewares/WatchDisk/WatchDisk.ts'
import { LoadGraphs } from '../middlewares/LoadGraphs/LoadGraphs.ts'
import { WriteGraphs } from '../middlewares/WriteGraphs/WriteGraphs.ts'
import { Websockets } from '../middlewares/Websockets/Websockets.ts'

export const createMiddlewares = (folder: string, typeMapping: { [key: string]: string }, websocketsPort = 8001) => {
  return { 
    Prefixes: new Prefixes(),
    WatchDisk: new WatchDisk(folder),
    LoadGraphs: new LoadGraphs(folder),
    ForceGraph: new ForceGraph(),
    Events: new Events(),
    Execute: new Execute(),
    Websockets: new Websockets(websocketsPort),
    WriteGraphs: new WriteGraphs(folder, typeMapping)
  }
}