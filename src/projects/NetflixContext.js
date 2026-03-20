import { createContext, useContext, useState, useEffect } from "react";

const LS_SCENARIO = "netflix_scenario";
const LS_DRIVERS  = "netflix_custom_drivers";

// Bump this version any time DEFAULT_DRIVERS values change; forces a localStorage reset
const DRIVERS_VERSION = 4;

// Custom scenario uses fixed gross adds; defaults are market-consensus estimates
// Gross adds 28.9→31.1M/Q: exact calibration to produce same net adds as Consensus (7→9M/Q at 2.2→1.9% churn)
//   grossAddsStart = 7.0 + (2.2/100 × 332 × 3) = 28.912 ≈ 28.9
//   grossAddsEnd   = 9.0 + (1.9/100 × 387 × 3) = 31.059 ≈ 31.1  (387M = Q4'27 beginSubs under consensus)
// ARM growth 3.0→5.0%/yr: conservative start (EM mix dilution), accelerates as ad-tier CPM scales
// Churn 2.2→1.9%/mo: modest improvement from sports content, ad-tier price floor, deeper slate
const DEFAULT_DRIVERS = { _v: DRIVERS_VERSION, netAddsStart: 28.9, netAddsEnd: 31.1, armGrowthStart: 3.0, armGrowthEnd: 5.0, churnStart: 2.2, churnEnd: 1.9 };

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
