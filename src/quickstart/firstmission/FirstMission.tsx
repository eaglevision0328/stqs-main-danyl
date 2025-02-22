import { useState, useEffect } from "react";
import { fetchContracts, acceptContract } from "../../Helper/api";
import { useNavigate } from "react-router-dom";
import { Contract, ContractDeliver } from "../../models/firstMission";
import "./FirstMission.css";

const FirstMission = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContract, setSelectedContract] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        const data = await fetchContracts();
        setContracts(data);
      } catch (err: any) {
        setError(err.message);
      }
      setLoading(false);
    };

    loadContracts();
  }, []);

  const handleAccept = async (contractId: string) => {
    setLoading(true);
    setError(null);
    try {
      await acceptContract(contractId);
      setContracts((prev) =>
        prev.map((contract) =>
          contract.id === contractId ? { ...contract, accepted: true } : contract
        )
      );
      setSelectedContract(contractId);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="first-mission-container">
      <h1>First Mission</h1>
      <p>Faction contracts are a great way to earn credits and learn the game.</p>
      {loading && <p>Loading contracts...</p>}
      {error && <p className="error">{error}</p>}

      <div>
        <h2>Available Contracts</h2>
        {!contracts || contracts.length === 0 ? <p>No contracts available.</p> : (
          <ul>
            {contracts.map((contract) => (
              <li key={contract.id} className="contract-item">
                <p><strong>Contract ID:</strong> {contract.id}</p>
                <p><strong>Faction:</strong> {contract.factionSymbol}</p>
                <p><strong>Deadline:</strong> {new Date(contract.terms.deadline).toLocaleString()}</p>
                <p><strong>Status:</strong> {contract.accepted ? "Accepted" : "Pending"}</p>
                <h3>Contract Terms:</h3>
                <ul>
                  {contract.terms.deliver.map((term: ContractDeliver, index: number) => (
                    <li key={index}>
                      Deliver <strong>{term.unitsRequired}</strong> {term.tradeSymbol} to {term.destinationSymbol}
                    </li>
                  ))}
                </ul>
                {!contract.accepted && (
                  <button onClick={() => handleAccept(contract.id)} disabled={loading}>
                    Accept Contract
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedContract && (
        <div className="mission-info">
          <h2>Contract Accepted! Next Steps</h2>
          <p>Now that you've accepted your contract, you need to:</p>
          <ol>
            <li>Purchase a ship</li>
            <li>Navigate to an asteroid field</li>
            <li>Mine ores until your cargo is full</li>
            <li>Deliver ores to the designated waypoint</li>
          </ol>
          <div className="button-group">
            <button onClick={() => navigate("/")}>
              Prev: NewGame
            </button>
            <button onClick={() => navigate("/purchase-ship")}>
              Next: PurchaseShip
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirstMission;