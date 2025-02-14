import React, { createContext, useState, useContext, ReactNode } from "react";

interface AsteroidContextType {
  asteroidWaypointSymbol: string | null;
  setAsteroidWaypointSymbol: (symbol: string | null) => void;
}

const AsteroidContext = createContext<AsteroidContextType | undefined>(undefined);

export const AsteroidProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [asteroidWaypointSymbol, setAsteroidWaypointSymbol] = useState<string | null>(null);

  return (
    <AsteroidContext.Provider value={{ asteroidWaypointSymbol, setAsteroidWaypointSymbol }}>
      {children}
    </AsteroidContext.Provider>
  );
};

export const useAsteroid = () => {
  const context = useContext(AsteroidContext);
  if (!context) {
    throw new Error("useAsteroid must be used within an AsteroidProvider");
  }
  return context;
};
