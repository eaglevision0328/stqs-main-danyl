import { fetchAgentDetails } from "./api";

export const getAgentDetailsWithSystem = async () => {
  try {
    const agentData = await fetchAgentDetails();
    const systemSymbol = agentData.headquarters.split("-").slice(0, 2).join("-");
    return { agentData, systemSymbol };
  } catch (error: any) {
    throw new Error(error.message || "Failed to fetch agent details");
  }
};
