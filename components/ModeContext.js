"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ModeContext = createContext({ isAdvanced: false, setIsAdvanced: () => {} });

export function ModeProvider({ children }) {
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("clinic-mode");
    if (saved) setIsAdvanced(saved === "advanced");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem("clinic-mode", isAdvanced ? "advanced" : "basic");
    }
  }, [isAdvanced, hydrated]);

  return (
    <ModeContext.Provider value={{ isAdvanced, setIsAdvanced }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
