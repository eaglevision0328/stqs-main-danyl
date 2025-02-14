import React, { useEffect, useState, useContext } from "react";
import { fetchMarketData, fetchShipCargo, dockShipSell, CargoShipSell } from "../../api";
import { useShip } from "../../context/ShipContext";
import { useAsteroid } from "../../context/AsteroidContext";
import { MarketDataType, CargoType } from "../../models/sellCargo";
import "./SellCargo.css";

const SellCargo = () => {
  const { ship_data } = useShip();
  const { asteroidWaypointSymbol } = useAsteroid();
  const [marketData, setMarketData] = useState<MarketDataType>();
  const [cargo, setCargo] = useState<CargoType>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  useEffect(() => {
    if (ship_data) {
      loadMarketData();
      loadShipCargo();
    }
  }, [ship_data]);

  const loadMarketData = async () => {
    if (!ship_data || !asteroidWaypointSymbol) {
      setError("No asteroid waypoint selected. Please mine asteroids first.");
      return;
    }
    try {
      const data = await fetchMarketData(ship_data.ship.nav.systemSymbol, asteroidWaypointSymbol);
      setMarketData(data);
    } catch (err) {
      setError("Failed to load market data");
    }
  };

  const loadShipCargo = async () => {
    if(!ship_data) return;
    try {
      const data = await fetchShipCargo(ship_data.ship.symbol);
      setCargo(data);
    } catch (err) {
      setError("Failed to load cargo data");
    }
  };

  const handleSell = async (units: number) => {
    if(!ship_data) return;
    setLoading(true);
    try {
      await dockShipSell(ship_data.ship.symbol);
      const response = await CargoShipSell(ship_data.ship.symbol, units);
      setCargo(response.cargo);
    } catch (err) {
      setError("Failed to sell cargo");
    }
    setLoading(false);
  };

  return (
    <div className="sell-cargo-container">
      <h1>Sell Cargo</h1>
      {error && <p className="error">{error}</p>}
      <h2>Market Data</h2>
      {marketData ? (
        <ul>
          <p>symbol: {marketData.symbol}</p>
          {marketData.tradeGoods?.map((item) => (
            <li key={item.symbol}>
              sellPrice: {item.sellPrice}, purchasePrice: {item.purchasePrice}, tradeVolume: {item.tradeVolume}
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading market data...</p>
      )}
      <h2>Your Cargo</h2>
      {cargo ? (
        // <ul>
        //   {cargo.map((item) => (
        //     <li key={item.symbol}>
        //       {item.symbol}: {item.units} units
        //       <button disabled={loading} onClick={() => handleSell(item.symbol, 10)}>Sell 10</button>
        //     </li>
        //   ))}
        // </ul>
        <div>
          <p>capacity: {cargo.capacity}</p>
          <p>units: {cargo.units}</p>
          <button disabled={loading} onClick={() => handleSell(cargo.units)}>sell</button>
        </div>
      ) : (
        <p>No cargo available</p>
      )}
    </div>
  );
};

export default SellCargo;





