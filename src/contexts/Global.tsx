import React, { useContext, createContext, useEffect, useState } from "react";
import data from "../config/data.json";

// Question data types
interface QuestionItem {
  text: string;
  answer: string;
  duration: number;
  marks: number;
  file?: string;
  isImage?: boolean;
  done?: boolean;
}

interface QuickQuestionSet {
  title: string;
  questions: QuestionItem[];
}

interface WindowsData {
  naturalSciences: QuestionItem[];
  humanSciences: QuestionItem[];
  misc: QuestionItem[];
  arts: QuestionItem[];
  religion: QuestionItem[];
  [key: string]: QuestionItem[];
}

interface EpisodeParts {
  speedQuestions: QuestionItem[];
  debate: QuestionItem;
  puzzles: QuestionItem[];
  windows: WindowsData;
  audienceQuestions: QuestionItem[];
  quickQuestions: QuickQuestionSet[];
  [key: string]: unknown;
}

export interface EpisodeData {
  leftTeamName: string;
  rightTeamName: string;
  parts: EpisodeParts;
  [key: string]: unknown;
}

interface GlobalContextValue {
  rightScore: number;
  setRightScore: React.Dispatch<React.SetStateAction<number>>;
  leftScore: number;
  setLeftScore: React.Dispatch<React.SetStateAction<number>>;
  rightsTurn: boolean;
  setRightsTurn: React.Dispatch<React.SetStateAction<boolean>>;
  quickQuestion: number;
  setQuickQuestion: React.Dispatch<React.SetStateAction<number>>;
  audienceQuestion: number;
  setAudienceQuestion: React.Dispatch<React.SetStateAction<number>>;
  turned: boolean;
  setTurned: React.Dispatch<React.SetStateAction<boolean>>;
  DATA: EpisodeData;
  setDATA: React.Dispatch<React.SetStateAction<EpisodeData>>;
}

const MyContext = createContext<GlobalContextValue>({
  rightScore: 0,
  setRightScore: () => {},
  leftScore: 0,
  setLeftScore: () => {},
  rightsTurn: false,
  setRightsTurn: () => {},
  quickQuestion: 0,
  setQuickQuestion: () => {},
  audienceQuestion: 0,
  setAudienceQuestion: () => {},
  turned: false,
  setTurned: () => {},
  DATA: data as EpisodeData,
  setDATA: () => {},
});

export function useGlobalContext(): GlobalContextValue {
  return useContext(MyContext);
}

interface GlobalContextProviderProps {
  children: React.ReactNode;
}

export function GlobalContextProvider({ children }: GlobalContextProviderProps) {
  useEffect(() => {}, []);
  const [rightScore, setRightScore] = useState<number>(0);
  const [leftScore, setLeftScore] = useState<number>(0);
  const [rightsTurn, setRightsTurn] = useState<boolean>(false);
  const [quickQuestion, setQuickQuestion] = useState<number>(0);
  const [audienceQuestion, setAudienceQuestion] = useState<number>(0);
  const [DATA, setDATA] = useState<EpisodeData>(data as EpisodeData);
  const [turned, setTurned] = useState<boolean>(false);

  const value: GlobalContextValue = {
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
