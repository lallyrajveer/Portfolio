import { createContext, useContext, useState } from "react";

export const NetflixContext = createContext(null);

export function NetflixProvider({ children }) {
  // "bear" | "base" | "bull" | "custom"
  const [scenario, setScenario] = useState("base");
  const [customDrivers, setCustomDrivers] = useState({ netAdds: 6.0, armGrowth: 1.5 });

  return (
    <NetflixContext.Provider value={{ scenario, setScenario, customDrivers, setCustomDrivers }}>
      {children}
    </NetflixContext.Provider>
  );
}

export function useNetflix() {
  return useContext(NetflixContext);
}
