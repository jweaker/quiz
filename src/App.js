import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Rate from "./screens/Rate";
import Windows from "./screens/Windows";

export default function App() {
  const [hideCursor, setHideCursor] = useState(false);
  const navigate = useNavigate();
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Escape":
          navigate(-1);
          break;
        case "Pause":
          setHideCursor((e) => !e);
          break;
        default:
          break;
      }
    },
    [navigate]
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
        <Route path="rate" element={<Rate />} />
      </Routes>
    </div>
  );
}
