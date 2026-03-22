import { createContext, useContext, useState, useEffect } from "react";

const LS_SCENARIO = "netflix_scenario";
const LS_DRIVERS  = "netflix_custom_drivers";

// Bump this version any time DEFAULT_DRIVERS values change; forces a localStorage reset
const DRIVERS_VERSION = 10;

// Custom scenario uses fixed net adds (same model as Bear/Consensus/Bull)
// netAddsStart/End in M/Q; armStart/End in $/mo; churnStart/End in %/mo
// armGrowthStart kept for buildForecast; armStart/End drive the slider in $/mo
// armEnd derived from Consensus armGrowthEnd=5.0%/yr: 12.23 × (1.0125)^8 ≈ 13.51
const DEFAULT_DRIVERS = { _v: 10, netAddsStart: 7.0, netAddsEnd: 9.0, armGrowthStart: 4.5, armStart: 12.23, armEnd: 13.51, churnStart: 1.9, churnEnd: 1.9 };

function migrateDrivers(d) {
  if (!d) return null;
  // Reset whenever the version doesn't match; catches all stale shapes
  if (d._v !== DRIVERS_VERSION) return null;
  return d;
}

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
  const [scenario, _setScenario] = useState(() => readLS(LS_SCENARIO, "consensus"));
  const [customDrivers, _setCustomDrivers] = useState(() => migrateDrivers(readLS(LS_DRIVERS, DEFAULT_DRIVERS)) ?? DEFAULT_DRIVERS);

  const setScenario = (val) => {
    _setScenario(val);
    localStorage.setItem(LS_SCENARIO, JSON.stringify(val));
  };

  const setCustomDrivers = (updater) => {
    _setCustomDrivers(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      localStorage.setItem(LS_DRIVERS, JSON.stringify({ _v: DRIVERS_VERSION, ...next }));
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
