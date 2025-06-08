import React, { useContext, createContext, useEffect, useState } from "react";
import data from "../config/data.json";
const MyContext = createContext({
  rightScore: 0,
  setRightScore: () => { },
  leftScore: 0,
  setLeftScore: () => { },
  rightsTurn: false,
  setRightsTurn: () => { },
  quickQuestion: 0,
  setQuickQuestion: () => { },
  discussionCounter: 0,
  setDiscussionCounter: () => { },
  turned: false,
  setTurned: () => { },
  DATA: {},
  setDATA: () => { },
});
export function useGlobalContext() {
  return useContext(MyContext);
}
export function GlobalContextProvider({ children }) {
  useEffect(() => { }, []);
  const [rightScore, setRightScore] = useState(0);
  const [leftScore, setLeftScore] = useState(0);
  const [rightsTurn, setRightsTurn] = useState(false);
  const [quickQuestion, setQuickQuestion] = useState(0);
  const [audienceQuestion, setAudienceQuestion] = useState(0);
  const [DATA, setDATA] = useState(data);
  const [turned, setTurned] = useState(false);

  const value = {
    rightScore,
    setAudienceQuestion,
    audienceQuestion,
    setRightScore,
    leftScore,
    setLeftScore,
    turned,
    setTurned,
    DATA,
    setDATA,
    rightsTurn,
    setRightsTurn,
    quickQuestion,
    setQuickQuestion,
  };
  return <MyContext.Provider value={value}>{children}</MyContext.Provider>;
}
