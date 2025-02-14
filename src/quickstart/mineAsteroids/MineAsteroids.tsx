import { useState, useEffect } from "react";
import {
  findEngineeredAsteroid,
  setShipToOrbit,
  navigateToAsteroid,
  dockShip,
  refuelShip,
  extractOres,
} from "../../api";
import "./MineAsteroids.css";
import { useShip } from "../../context/ShipContext";

const MineAsteroids = () => {
  const { ship_data } = useShip();
  const [status, setStatus] = useState<string>("Idle");
  const [error, setError] = useState<string | null>(null);
  const [asteroid, setAsteroid] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!ship_data) {
      setError("No ship available! Please purchase a available ship first.");
    }
    console.log("ship_data========>", ship_data)
  }, [ship_data]);
  
  const handleFindAsteroid = async () => {
    if (!ship_data) {
      setError("First, purchase a ship that is available for purchase on the purchase ship page.")
      return error;
    }
    setLoading(true);
    setError(null);
    setStatus("Searching for asteroid...");
    try {
      const data = await findEngineeredAsteroid(ship_data.ship.nav.systemSymbol);
      if (data && data.length > 0) {
        setAsteroid(data[0].symbol);
        setStatus(`Asteroid found: ${data[0].symbol}`);
      } else {
        setStatus("No engineered asteroids found.");
      }
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleNavigateToAsteroid = async () => {
    if (!ship_data) return;
    if (!asteroid) return setError("No asteroid found!");
    setLoading(true);
    setStatus("Setting ship to orbit...");
    try {
      await setShipToOrbit(ship_data.ship.symbol);
      setStatus("Navigating to asteroid...");
      await navigateToAsteroid(ship_data.ship.symbol, asteroid);
      setStatus("In transit to asteroid...");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDockAndRefuel = async () => {
    if (!ship_data) return;
    setLoading(true);
    setStatus("Docking at asteroid...");
    try {
      await dockShip(ship_data.ship.symbol);
      setStatus("Refueling...");
      await refuelShip(ship_data.ship.symbol);
      setStatus("Ship refueled. Ready to mine!");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleExtractOres = async () => {
    if (!ship_data) return;
    setLoading(true);
    setStatus("Extracting ores...");
    try {
      const data = await extractOres(ship_data.ship.symbol);
      setStatus(`Extracted: ${data.extraction}`);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="mine-asteroids-container">
      <h1>Mine Asteroids</h1>
      <div className="grid-2">
        <button onClick={handleFindAsteroid} disabled={loading}>
          Find Engineered Asteroid
        </button>
        <button onClick={handleNavigateToAsteroid} disabled={loading || !asteroid}>
          Navigate to Asteroid
        </button>
        <button onClick={handleDockAndRefuel} disabled={loading || !asteroid}>
          Dock & Refuel
        </button>
        <button onClick={handleExtractOres} disabled={loading || !asteroid}>
          Extract Ores
        </button>
      </div>
      <div className="result-box">
        <p className="status">Status: {status}</p>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default MineAsteroids;