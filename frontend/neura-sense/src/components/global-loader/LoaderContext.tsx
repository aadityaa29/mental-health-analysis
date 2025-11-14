"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import GlobalMentalHealthLoader from "./GlobalMentalHealthLoader";

type LoaderContextType = {
  showLoader: () => void;
  hideLoader: () => void;
  loading: boolean;
};

const LoaderContext = createContext<LoaderContextType>({
  showLoader: () => {},
  hideLoader: () => {},
  loading: false,
});

export const useGlobalLoader = () => useContext(LoaderContext);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);

  const showLoader = () => setLoading(true);
  const hideLoader = () => setLoading(false);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, loading }}>
      {children}
      <GlobalMentalHealthLoader show={loading} />
    </LoaderContext.Provider>
  );
}
