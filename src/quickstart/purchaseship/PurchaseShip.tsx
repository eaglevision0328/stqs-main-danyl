import { useState, useEffect, useCallback } from "react";
import { findShipyards, getAvailableShips, purchaseShip } from "../../api";
import { useNavigate } from "react-router-dom";
import "./PurchaseShip.css";
import { getAgentDetailsWithSystem } from "../../utils";
import { useShip } from "../../context/ShipContext";
import { shipsType } from "../../models/purchaseShip";

const PurchaseShip = () => {
  const [shipyards, setShipyards] = useState<any[]>([]);
  const [selectedShipyard, setSelectedShipyard] = useState<string | null>(null);
  const [ships, setShips] = useState<shipsType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setShipData } = useShip();

  useEffect(() => {
    const loadShipyards = async () => {
      setLoading(true);
      try {
        const { systemSymbol } = await getAgentDetailsWithSystem();
        const data = await findShipyards(systemSymbol);
        setShipyards(data);
      } catch (err: any) {
        setError(err.message || "Failed to load shipyards.");
      } finally {
        setLoading(false);
      }
    };

    loadShipyards();
  }, []);

  // 🔹 Fetch available ships for a selected shipyard
  const loadShips = useCallback(async (systemSymbol: string, waypointSymbol: string) => {
    setLoading(true);
    setError(null);
    setShips(null);
    try {
      const data = await getAvailableShips(systemSymbol, waypointSymbol);
      setShips(data);
      setSelectedShipyard(waypointSymbol);
    } catch (err: any) {
      setError(err.message || "Failed to fetch ships.");
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔹 Handle ship purchase
  const handlePurchase = async (shipType: string) => {
    if (!selectedShipyard) {
      setError("Please select a shipyard first.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const purchasedShip = await purchaseShip(shipType, selectedShipyard);
      console.log("purchasedShip===>", purchasedShip)
      setShipData({
        agent: purchasedShip.agent,
        ship: purchasedShip.ship,
        transaction: purchasedShip.transaction,
      });

      alert(`Successfully purchased ${shipType}!`);
      navigate("/mine-asteroids");
    } catch (err: any) {
      setError(err.message || "Failed to purchase the ship.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="purchase-ship-container">
      <h1>Purchase Ship</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <h2>Select a Shipyard</h2>
      {shipyards.length > 0 ? (
        <ul className="shipyard-list">
          {shipyards.map((yard) => (
            <li key={yard.symbol} className="shipyard-item">
              <span>{yard.symbol}</span>
              <button className="view-ships-btn" onClick={() => loadShips(yard.systemSymbol, yard.symbol)}>
                View Ships
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No shipyards available.</p>
      )}

      {ships && (
        <>
          <h2>Available Ships</h2>
          {ships.ships ? (
            <ul className="ship-list">
              {ships.ships.map((ship, index: number) => (
                <li key={index} className="ship-item">
                  <span>{ship.name}</span>
                  <button className="buy-btn" onClick={() => handlePurchase(ship.type)}>
                    Buy
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No ships available at this shipyard.</p>
          )}
        </>
      )}
    </div>
  );
};

export default PurchaseShip;