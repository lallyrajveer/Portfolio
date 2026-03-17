import { createContext, useContext, useState } from "react";

export const WirelessContext = createContext(null);

export function WirelessProvider({ children }) {
  // "bear" | "base" | "bull" | "custom"
  const [scenario, setScenario] = useState("base");
  const [customDrivers, setCustomDrivers] = useState({ netAdds: 100, arpuGrowth: 0.35, churn: 0.92 });

  return (
    <WirelessContext.Provider value={{ scenario, setScenario, customDrivers, setCustomDrivers }}>
      {children}
    </WirelessContext.Provider>
  );
}

export function useWireless() {
  return useContext(WirelessContext);
}
