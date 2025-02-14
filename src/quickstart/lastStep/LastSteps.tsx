import { useState, useEffect } from "react";
import { navigateToDelivery, deliverContractGoods, fulfillContract, fetchContracts } from "../../api";
import { useNavigate } from "react-router-dom";
import { getAgentDetailsWithSystem } from "../../utils";
import { useShip } from "../../context/ShipContext";
import "./LastSteps.css";

const LastSteps = () => {
  const { ship_data } = useShip();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contractId, setContractId] = useState<string | null>(null);
  const [deliveryWaypoint, setDeliveryWaypoint] = useState<string | null>(null);
  const [shipSymbol, setShipSymbol] = useState<string | null>(null);
  const [systemSymbol, setSystemSymbol] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchContracts();
        setContractId(data[0].id)
        const { agentData, systemSymbol } = await getAgentDetailsWithSystem();
        setSystemSymbol(systemSymbol);
        if (agentData) {
          setDeliveryWaypoint(agentData.headquarters)
        }
        if(!ship_data) return;
        setShipSymbol(ship_data?.ship.symbol);

      } catch (err: any) {
        setError(err.message || "Failed to load contract details.");
      }
      setLoading(false);
    };

    loadData();
  }, []);

  const handleNavigate = async () => {
    if (!shipSymbol || !deliveryWaypoint) return setError("Missing ship or delivery waypoint.");
    setLoading(true);
    setError(null);
    try {
      await navigateToDelivery(shipSymbol, deliveryWaypoint);
      setSuccessMessage(`Ship ${shipSymbol} is navigating to ${deliveryWaypoint}...`);
    } catch (err: any) {
      setError(err.message || "Navigation failed.");
    }
    setLoading(false);
  };

  const handleDeliverGoods = async () => {
    if (!contractId || !shipSymbol) return setError("Missing contract or ship details.");
    setLoading(true);
    setError(null);
    try {
      await deliverContractGoods(contractId, shipSymbol, "COPPER_ORE", 100);
      setSuccessMessage("Goods delivered successfully!");
    } catch (err: any) {
      setError(err.message || "Delivery failed.");
    }
    setLoading(false);
  };

  const handleFulfillContract = async () => {
    if (!contractId) return setError("No active contract found.");
    setLoading(true);
    setError(null);
    try {
      await fulfillContract(contractId);
      setSuccessMessage("Contract fulfilled! Payment received.");
    } catch (err: any) {
      setError(err.message || "Contract fulfillment failed.");
    }
    setLoading(false);
  };

  return (
    <div className="last-steps-container">
      <h1>Last Steps</h1>
      <p>Complete your contract by delivering the mined ores and fulfilling the terms.</p>
      {loading && <p>Processing...</p>}
      {error && <p className="error">{error}</p>}
      {successMessage && <p className="success">{successMessage}</p>}

      <div className="action-buttons">
        <button onClick={handleNavigate} disabled={loading || !shipSymbol || !deliveryWaypoint}>
          Navigate to Delivery Waypoint
        </button>
        <button onClick={handleDeliverGoods} disabled={loading || !contractId || !shipSymbol}>
          Deliver Goods
        </button>
        <button onClick={handleFulfillContract} disabled={!contractId}>
          Fulfill Contract
        </button>
      </div>

      <div className="button-group">
        <button onClick={() => navigate("/sell-cargo")}>Prev: Sell Cargo</button>
        <button onClick={() => navigate("/")}>Restart Game</button>
      </div>
    </div>
  );
};

export default LastSteps;
