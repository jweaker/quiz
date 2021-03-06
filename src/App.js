import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import { useGlobalContext } from "./contexts/Global";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Rate from "./screens/Rate";
import Windows from "./screens/Windows";

export default function App() {
  const [hideCursor, setHideCursor] = useState(false);
  const { setRightsTurn, setTurned } = useGlobalContext();
  const navigate = useNavigate();
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      switch (e.key) {
        case "Escape":
          navigate(-1);
          break;
        case "F8":
          setHideCursor((e) => !e);
          break;
        case "PageUp":
          setRightsTurn((e) => !e);
          setTurned(true);
          break;
        default:
          break;
      }
    },
    [navigate, setRightsTurn, setTurned]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className={"App" + (hideCursor ? " hideCursor" : "")}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="windows" element={<Windows />} />
        <Route path="questionpicker/:id" element={<QuestionPicker />} />
        <Route path="question/:type/:id/:index" element={<Question />} />
        <Route path="rate/:type" element={<Rate />} />
      </Routes>
    </div>
  );
}
