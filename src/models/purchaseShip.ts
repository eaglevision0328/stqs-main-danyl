export interface shipsType {
  modificationsFee: number,
  shipTypes: shipType[],
  ships?:any[],
  symbol: string
}

interface shipType {
  type: string
}