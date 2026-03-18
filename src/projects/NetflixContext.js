import { createContext, useContext, useState, useEffect } from "react";

const LS_SCENARIO = "netflix_scenario";
const LS_DRIVERS  = "netflix_custom_drivers";

const DEFAULT_DRIVERS = { netAdds: 6.0, armGrowth: 3.0, churn: 2.3 };

function readLS(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export const NetflixContext = createContext(null);

export function NetflixProvider({ children }) {
  const [scenario, _setScenario] = useState(() => readLS(LS_SCENARIO, "base"));
  const [customDrivers, _setCustomDrivers] = useState(() => readLS(LS_DRIVERS, DEFAULT_DRIVERS));

  const setScenario = (val) => {
    _setScenario(val);
    localStorage.setItem(LS_SCENARIO, JSON.stringify(val));
  };

  const setCustomDrivers = (updater) => {
    _setCustomDrivers(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(LS_DRIVERS, JSON.stringify(next));
      return next;
    });
  };

  // Sync across tabs via storage events
  useEffect(() => {
    const handler = (e) => {
      if (e.key === LS_SCENARIO && e.newValue) _setScenario(JSON.parse(e.newValue));
      if (e.key === LS_DRIVERS  && e.newValue) _setCustomDrivers(JSON.parse(e.newValue));
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  return (
    <NetflixContext.Provider value={{ scenario, setScenario, customDrivers, setCustomDrivers }}>
      {children}
    </NetflixContext.Provider>
  );
}

export function useNetflix() {
  return useContext(NetflixContext);
}
