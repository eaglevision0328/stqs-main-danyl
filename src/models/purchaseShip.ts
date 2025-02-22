export interface shipsType {
  modificationsFee: number,
  shipTypes: shipType[],
  ships?:any[],
  symbol: string
}

interface shipType {
  type: string
}

export interface Shipyard {
  symbol: string,
  shipTypes: shipType[],
  transactions?: Transaction[],
  ships?: Ship[],
  modificationsFee?: number,
}

interface Transaction {
  shipSymbol: string,
  shipType: string,
  waypointSymbol: string,
  agentSymbol: string,
  price: number,
  timestamp: string,
}

interface Ship {
  type: string,
  name: string,
  description: string,
  supply: string,
  activity: string,
  purchasePrice: number,
  frame: Frame,
  reactor: Reactor,
  engine: Engine,
  modules: Module[],
  mounts: Mount[],
  crew: Crew,
}

interface Frame {
  symbol: string,
  name: string,
  description: string,
  moduleSlots: number,
  mountingPoints: number,
  fuelCapacity: number,
  quality: number,
  requirements: Requirements,
  condition: number,
  integrity: number,
}

interface Reactor {
  symbol: string,
  name: string,
  description: string,
  powerOutput: number,
  quality: number,
  requirements: Requirements,
  condition: number,
  integrity: number,
}

interface Engine {
  symbol: string,
  name: string,
  description: string,
  speed: number,
  quality: number,
  requirements: Requirements,
  condition: number,
  integrity: number,
}

interface Module {
  symbol: string,
  name: string,
  description: string,
  capacity?: number,
  requirements: Requirements,
}

interface Mount {
  symbol: string,
  name: string,
  description: string,
  strength: number,
  deposits?: string[],
  requirements: Requirements,
}

interface Crew {
  required: number,
  capacity: number,
}

interface Requirements {
  power: number,
  crew: number,
  slots?: number,
}
