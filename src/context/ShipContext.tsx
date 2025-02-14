import { createContext, useContext, useState, ReactNode } from "react";

interface ShipData {
  agent: any;
  ship: any;
  transaction: any;
}

interface ShipContextType {
  ship_data: ShipData | null;
  setShipData: (ship_data: ShipData) => void;
}

interface ShipProviderProps {
  children: ReactNode;
  shipData?: ShipData; // Allow passing initial ship data
}

export const ShipContext = createContext<ShipContextType | undefined>(undefined);

export const ShipProvider = ({ children, shipData }: ShipProviderProps) => {
  const [ship_data, setShipData] = useState<ShipData | null>(() => {
    // Load from localStorage if exists (persistence)
    const savedShip = localStorage.getItem("purchasedShip");
    return shipData || (savedShip ? JSON.parse(savedShip) : null);
  });

  const saveShip = (ship_data: ShipData) => {
    setShipData(ship_data);
    localStorage.setItem("purchasedShip", JSON.stringify(ship_data)); // Persist
  };

  return (
    <ShipContext.Provider value={{ ship_data, setShipData: saveShip }}>
      {children}
    </ShipContext.Provider>
  );
};

export const useShip = (): ShipContextType => {
  const context = useContext(ShipContext);
  if (!context) {
    throw new Error("useShip must be used within a ShipProvider");
  }
  return context;
};
