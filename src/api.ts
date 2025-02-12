const API_BASE_URL = "https://api.spacetraders.io/v2";

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
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  if (!token) throw new Error("Token expired. Please re-login.");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Request failed");

  return data.data;
};

// Register a new agent
export const registerAgent = async (symbol: string, faction: string) => {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symbol, faction }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Registration failed");

  saveToken(data.data.token, 3600); // API token expires in 1 hour
  return data.data;
};

// Fetch Agent Details
export const fetchAgentDetails = () => apiRequest("/my/agent");

// Fetch Starting Location
export const fetchStartingLocation = (systemSymbol: string, waypointSymbol: string) =>
  apiRequest(`/systems/${systemSymbol}/waypoints/${waypointSymbol}`);
