import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useShowStore } from "./state";
import type { EpisodeData } from "./state";
import defaultData from "./config/data.json";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Rate from "./screens/Rate";
import Windows from "./screens/Windows";
import OperatorRoot from "./app/OperatorRoot";
import AudienceRoot from "./app/AudienceRoot";
import { lazy, Suspense } from "react";

// Lazy-load route screens that are only needed for their respective routes
const OperatorPanel = lazy(() => import("./screens/operator/OperatorPanel"));
const AudienceDisplay = lazy(() => import("./screens/audience/AudienceDisplay"));
const Settings = lazy(() => import("./screens/operator/Settings"));

export default function App() {
  const [hideCursor, setHideCursor] = useState<boolean>(false);
  const toggleTurn = useShowStore((state) => state.toggleTurn);
  const navigate = useNavigate();

  // Load default episode data if store has none (first load or after reset)
  useEffect(() => {
    if (useShowStore.getState().data === null) {
      useShowStore.getState().setData(defaultData as EpisodeData);
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(e.key);
      switch (e.key) {
        case "Escape":
          if (window.location.pathname !== "/") navigate(-1);
          break;
        case "c":
          setHideCursor((prev) => !prev);
          break;
        case "s":
          toggleTurn();
          break;
        default:
          break;
      }
    },
    [navigate, toggleTurn],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <Suspense fallback={null}>
      <Routes>
        {/* Root redirects to operator panel */}
        <Route path="/" element={<Navigate to="/operator" replace />} />

        {/* Operator routes */}
        <Route path="/operator" element={<OperatorRoot />}>
          <Route index element={<OperatorPanel />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Audience routes */}
        <Route path="/audience" element={<AudienceRoot />}>
          <Route index element={<AudienceDisplay />} />
        </Route>

        {/* Legacy routes (existing show screens) */}
        <Route path="/legacy" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="windows" element={<Windows />} />
              <Route path="questionpicker/:id" element={<QuestionPicker />} />
              <Route path="question/:type/:id/:index" element={<Question />} />
              <Route path="question/:type/:id" element={<Question />} />
              <Route path="question/:type" element={<Question />} />
              <Route path="rate/:type" element={<Rate />} />
            </Routes>
          </div>
        } />

        {/* Keep original routes at root level for backward compatibility during migration */}
        <Route path="windows" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Windows />
          </div>
        } />
        <Route path="questionpicker/:id" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <QuestionPicker />
          </div>
        } />
        <Route path="question/:type/:id/:index" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Question />
          </div>
        } />
        <Route path="question/:type/:id" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Question />
          </div>
        } />
        <Route path="question/:type" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Question />
          </div>
        } />
        <Route path="rate/:type" element={
          <div className={"w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]" + (hideCursor ? " cursor-none" : "")}>
            <Rate />
          </div>
        } />
      </Routes>
    </Suspense>
  );
}
