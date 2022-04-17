import React, { useContext, createContext, useEffect } from "react";
const MyContext = createContext({ collapsed: false, setCollapsed: () => {} });
export function useGlobalContext() {
  return useContext(MyContext);
}
export function GlobalContextProvider({ children }) {
  useEffect(() => {}, []);

  const value = {};
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
