// AGENT

export interface AgentData {
  accountId: string;
  symbol: string;
  headquarters: string;
  credits: number;
  startingFaction: string;
  shipCount: number;
}

export interface Location {
  symbol: string;
  isUnderConstruction?: boolean;
  orbitals: [
    {
      symbol: string;
    }
  ];
  faction: {
    symbol: string;
  };
  traits: [
    {
      symbol: string;
      name: string;
      description: string;
    }
  ];
  chart: {
    waypointSymbol?: string;
    submittedBy: string;
    submittedOn: string | Date;
  };
  type: string;
  systemSymbol: string;
  x: number;
  y: number;
}