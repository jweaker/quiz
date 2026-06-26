import { useCallback, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useShowStore } from "./state";
import type { Episode } from "./lib/episodeSchema";
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
const EpisodeEditor = lazy(() => import("./screens/editor/EpisodeEditor"));

export default function App() {
  const [hideCursor, setHideCursor] = useState(false);
  const swapSides = useShowStore((s) => s.swapSides);
  const setTurned = useShowStore((s) => s.setTurned);
  const location = useLocation();
  const navigate = useNavigate();

  // Load default episode data if store has none (first load or after reset)
  useEffect(() => {
    if (useShowStore.getState().data === null) {
      useShowStore.getState().setData(defaultData as Episode);
    }
  }, []);

  const isLegacyPath =
    !location.pathname.startsWith("/operator") &&
    !location.pathname.startsWith("/audience") &&
    !location.pathname.startsWith("/editor");

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLegacyPath) return;

      const target = e.target as HTMLElement | null;
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;
      if (isTyping) return;

      switch (e.key) {
        case "Escape":
          if (window.location.pathname !== "/") navigate(-1);
          break;
        case "c":
        case "C":
          setHideCursor((prev) => !prev);
          break;
        case "s":
        case "S":
          swapSides();
          setTurned(true);
          break;
        default:
          break;
      }
    },
    [isLegacyPath, navigate, setTurned, swapSides],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [handleGlobalKeyDown]);

  return (
    <Suspense fallback={null}>
      <div className={hideCursor ? "hide-cursor" : ""}>
        <Routes>
        {/* Root redirects to operator panel */}
        <Route path="/" element={<Navigate to="/operator" replace />} />

        {/* Operator routes */}
        <Route path="/operator" element={<OperatorRoot />}>
          <Route index element={<OperatorPanel />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Editor route */}
        <Route path="/editor" element={<EpisodeEditor />} />

        {/* Audience routes */}
        <Route path="/audience" element={<AudienceRoot />}>
          <Route index element={<AudienceDisplay />} />
        </Route>

        {/* Legacy routes (existing show screens) */}
        <Route path="/legacy" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
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
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <Windows />
          </div>
        } />
        <Route path="questionpicker/:id" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <QuestionPicker />
          </div>
        } />
        <Route path="question/:type/:id/:index" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <Question />
          </div>
        } />
        <Route path="question/:type/:id" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <Question />
          </div>
        } />
        <Route path="question/:type" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <Question />
          </div>
        } />
        <Route path="rate/:type" element={
          <div className="w-screen h-screen p-0 m-0 bg-[radial-gradient(circle,rgba(89,133,227,1)_0%,rgba(20,37,74,1)_100%)]">
            <Rate />
          </div>
        } />
        </Routes>
      </div>
    </Suspense>
  );
}
