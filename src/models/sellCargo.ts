export interface MarketDataType {
  symbol: string;
  imports: any[];
  exports: any[];
  exchange: any[];
  transactions?: any[];
  tradeGoods?: tradeGoodType[];
}

export interface CargoType {
  capacity:number;
  units:number;
  inventory:any[];
}

interface tradeGoodType {
  symbol: string;
  tradeVolume: number;
  type: string;
  supply: string;
  purchasePrice: number;
  sellPrice: number;
}