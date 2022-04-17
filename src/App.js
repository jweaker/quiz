import { useCallback, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Windows from "./screens/Windows";

export default function App() {
  const navigate = useNavigate();
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Escape":
          navigate(-1);
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
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="windows" element={<Windows />} />
        <Route path="questionpicker/:id" element={<QuestionPicker />} />
        <Route path="question/:id/:index" element={<Question />} />
      </Routes>
    </div>
  );
}
