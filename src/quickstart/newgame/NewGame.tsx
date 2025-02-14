import { useState, useEffect } from "react";
import { registerAgent, fetchStartingLocation, getToken, clearToken } from "../../api";
import { useNavigate } from "react-router-dom";
import { getAgentDetailsWithSystem } from "../../utils";
import "./NewGame.css";

/**
 * This component is a basic MVP of part one of the quickstart. It handles registering your agent and receives a token
 * which you will need to use in subsequent calls. Therefore, you might want to refactor or replace this as you move forward.
 */

function NewGame() {
  const [form, setForm] = useState({ symbol: "", faction: "COSMIC" });
  const [loading, setLoading] = useState(false);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<any>(null);
  const [location, setLocation] = useState<any>(null);
  const navigate = useNavigate();

  // Check if token exists & is still valid
  useEffect(() => {
    const initializeGame = async () => {
      const token = getToken();
      if (!token){
        setIsLoadingAgent(false);
        return;
      }

      try {
        const { agentData, systemSymbol } = await getAgentDetailsWithSystem();
        setAgent(agentData);
        const locationData = await fetchStartingLocation(systemSymbol, agentData.headquarters);
        setLocation(locationData);
      } catch (err: any) {
        clearToken();
        //sessionStorage.clear(); // Clear expired token
        setError("Session expired. Please re-register.");
      } finally {
        setIsLoadingAgent(false);
      }
    };

    initializeGame();
  }, []);

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      await registerAgent(form.symbol, form.faction);
      const { agentData, systemSymbol } = await getAgentDetailsWithSystem();
      setAgent(agentData);

      const locationData = await fetchStartingLocation(systemSymbol, agentData.headquarters);
      setLocation(locationData);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleReset = () => {
    clearToken();
    setAgent(null);
    setLocation(null);
    setError(null);
    setIsLoadingAgent(false);
  };

  return (
    <div className="new-game-container">
      <h1>New Game</h1>

      {isLoadingAgent ? (
        <p>Loading...</p>
      ) : !agent ? (
        <>
          <div className="input-group">
            <h1>Call Sign</h1>
            <input
              name="symbol"
              value={form.symbol}
              onChange={(e) => setForm({ ...form, symbol: e.target.value })}
              placeholder="Enter Call Sign"
            />
          </div>
          <div className="input-group">
            <label>Faction</label>
            <input
              name="faction"
              value={form.faction}
              onChange={(e) => setForm({ ...form, faction: e.target.value })}
            />
          </div>
          <div className="button-group">
            <button onClick={handleRegister} className="register-btn" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </button>
          </div>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </>
      ) : (
        <>
          <h2>Register as a new agent</h2>
          <div className="agent-info">
            <p><strong>Symbol:</strong> {agent.symbol}</p>
            <p><strong>Credits:</strong> {agent.credits}</p>
          </div>

          <h2>Starting Location</h2>
          {location ? (
            <div className="location-info">
              <p><strong>Waypoint:</strong> {location.symbol}</p>
              <p><strong>System Symbol:</strong> {location.systemSymbol}</p>
              <p><strong>Type:</strong> {location.type}</p>
              <p><strong>Coordinates:</strong> ({location.x}, {location.y})</p>
              <div className="button-group">
                <button onClick={() => navigate("/first-mission")} className="register-btn">
                  Next: First Mission
                </button>
                <button onClick={handleReset} className="reset-btn">
                  Reset Game
                </button>
              </div>
            </div>
          ) : (
            <p>Loading location details...</p>
          )}
        </>
      )}
    </div>
  );
}

export default NewGame;