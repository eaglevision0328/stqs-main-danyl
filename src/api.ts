const API_BASE_URL = "https://api.spacetraders.io/v2";
const ACCOUNT_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZGVudGlmaWVyIjoiY203MzU3MGRuMDAweXRjMGp4b3k0NGs0byIsInZlcnNpb24iOiJ2Mi4zLjAiLCJpYXQiOjE3Mzk0Mzk5MjgsInN1YiI6ImFjY291bnQtdG9rZW4ifQ.bcTJWlby1ytr4gDVVQN3SZs7oXHcqxbZUBxqFXwfAcldXxxlp69TxYKL3QvcK5CtOl3B8w55wtSpFzReKnmpESt0-vNzIkcGCjYnsCCVNqo9azsBPO29LKTHmPgBS7uDyTekE7rqLW9IxOtYlla3YtbCETyDlA5Fs1D6OslPSEHe2sbqeueJcHBrUOo71imQCraxioR2UlUjaPvixqN4EGOZIfqtSf9BaxQZGgQSUDLaYWNh4Vtsa4YmJbo_L2plB3ZkYMiFN6ECHhDYdelaVpNtB90B9zrx2Y0EGUKeHh8zFp3-pxk5XbXRm8TOc0JYrJuqAT9EJ9hAtZTVZHaKgw';
// Helper to store token and expiration time
export const saveToken = (token: string, expiresIn: number) => {
  const expiryTime = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("tokenExpiry", expiryTime.toString());
};

// Helper to get the stored token, checking if it expired
export const getToken = () => {
  const token = sessionStorage.getItem("token");
  const expiry = sessionStorage.getItem("tokenExpiry");

  if (!token || !expiry || Date.now() > parseInt(expiry)) {
    clearToken();
    return null;
  }
  return token;
};

// Clears session storage when token expires
export const clearToken = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("tokenExpiry");
};

// API Request Utility (reduces redundant fetch logic)
const apiRequest = async (endpoint: string, options: RequestInit = {}, body?: object) => {
  const token = getToken();
  if (!token) throw new Error("Token expired. Please re-login.");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Request failed");

  return data.data;
};

// Register a new agent
export const registerAgent = async (symbol: string, faction: string) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${ACCOUNT_TOKEN}` },
    body: JSON.stringify({ symbol, faction }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Registration failed");

  saveToken(data.data.token, 7200); // API token expires in 1 hour
  return data.data;
};

// Fetch Agent Details
export const fetchAgentDetails = () => apiRequest("/my/agent");

// Fetch Starting Location
export const fetchStartingLocation = (systemSymbol: string, waypointSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints/${waypointSymbol}`);

// Fetch Contracts
export const fetchContracts = () => apiRequest("/my/contracts");

// Accept Contract
export const acceptContract = (contractId: string) =>
  apiRequest(`/my/contracts/${contractId}/accept`, { method: "POST" });


/******
 *** 
    New Ship Purchase Features 
 ***
 ******/

export const findShipyards = (systemSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints?traits=SHIPYARD`);

export const getAvailableShips = (systemSymbol: string, shipyardWaypointSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints/${shipyardWaypointSymbol}/shipyard`);

export const purchaseShip = (shipType: string, shipyardWaypointSymbol: string) =>
  apiRequest(`/my/ships`, { method: "POST" }, { shipType, waypointSymbol: shipyardWaypointSymbol });

/******
 *** 
    Mine Asteroids Features 
 ***
 ******/

// Find engineered asteroid
export const findEngineeredAsteroid = (systemSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints?type=ENGINEERED_ASTEROID`);

// Set ship to orbit mode
export const setShipToOrbit = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/orbit`, { method: "POST" });

// Navigate ship to asteroid
export const navigateToAsteroid = (shipSymbol: string, waypointSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/navigate`, { method: "POST" }, { waypointSymbol });

// Dock ship at asteroid
export const dockShip = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/dock`, { method: "POST" });

// Refuel ship
export const refuelShip = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/refuel`, { method: "POST" });

// Extract ores
export const extractOres = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/extract`, { method: "POST" });

// Jettison ores
// export const jettisonShip = (shipSymbol: string, symbol: string, units: string) =>
//   apiRequest(`/my/ships/${shipSymbol}/jettison`, { method: "POST" }, {symbol, units});

// Cargo ores
export const cargoShip = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/cargo`, { method: "POST" });

/******
 *** 
    Sell Cargo Features 
 ***
 ******/

// Fetch market data for a specific asteroid waypoint
export const fetchMarketData = (systemSymbol: string, asteroidWaypointSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints/${asteroidWaypointSymbol}/market`);

// Get ship's cargo details
export const fetchShipCargo = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/cargo`);

// Dock the ship before selling goods
export const dockShipSell = (shipSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/dock`, { method: "POST" });

// Sell cargo at the market
export const CargoShipSell = (shipSymbol: string, units: number) =>
  apiRequest(`/my/ships/${shipSymbol}/sell`, { method: "POST" }, { symbol: shipSymbol, units });

/******
 *** 
    Last Step Features 
 ***
 ******/
// Navigate to delivery waypoint
export const navigateToDelivery = (shipSymbol: string, deliveryWaypointSymbol: string) =>
  apiRequest(`/my/ships/${shipSymbol}/navigate`, { method: "POST" }, { waypointSymbol: deliveryWaypointSymbol });

// Deliver contract goods
export const deliverContractGoods = (contractId: string, shipSymbol: string, tradeSymbol: string, units: number) =>
  apiRequest(`/my/contracts/${contractId}/deliver`, { method: "POST" }, { shipSymbol, tradeSymbol, units });

// Fulfill contract
export const fulfillContract = (contractId: string) =>
  apiRequest(`/my/contracts/${contractId}/fulfill`, { method: "POST" });