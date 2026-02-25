import { useCallback, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import { useGlobalContext } from "./contexts/Global";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Rate from "./screens/Rate";
import Windows from "./screens/Windows";

const VIEWPORT_STORAGE_KEY = "quiz.viewport.settings";

const VIEWPORT_DEFAULTS = {
  deadTop: 0,
  deadRight: 0,
  deadBottom: 0,
  deadLeft: 0,
};

const VIEWPORT_LIMITS = {
  deadMin: 0,
  deadMax: 800,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeViewportSettings = (settings = VIEWPORT_DEFAULTS) => ({
  deadTop: Math.round(
    clamp(
      toNumber(settings.deadTop, VIEWPORT_DEFAULTS.deadTop),
      VIEWPORT_LIMITS.deadMin,
      VIEWPORT_LIMITS.deadMax,
    ),
  ),
  deadRight: Math.round(
    clamp(
      toNumber(settings.deadRight, VIEWPORT_DEFAULTS.deadRight),
      VIEWPORT_LIMITS.deadMin,
      VIEWPORT_LIMITS.deadMax,
    ),
  ),
  deadBottom: Math.round(
    clamp(
      toNumber(settings.deadBottom, VIEWPORT_DEFAULTS.deadBottom),
      VIEWPORT_LIMITS.deadMin,
      VIEWPORT_LIMITS.deadMax,
    ),
  ),
  deadLeft: Math.round(
    clamp(
      toNumber(settings.deadLeft, VIEWPORT_DEFAULTS.deadLeft),
      VIEWPORT_LIMITS.deadMin,
      VIEWPORT_LIMITS.deadMax,
    ),
  ),
});

const getStoredViewportSettings = () => {
  try {
    const raw = localStorage.getItem(VIEWPORT_STORAGE_KEY);
    if (!raw) return VIEWPORT_DEFAULTS;
    return sanitizeViewportSettings(JSON.parse(raw));
  } catch (error) {
    return VIEWPORT_DEFAULTS;
  }
};

export default function App() {
  const [hideCursor, setHideCursor] = useState(false);
  const [showViewportControls, setShowViewportControls] = useState(false);
  const [viewportSettings, setViewportSettings] = useState(
    getStoredViewportSettings,
  );
  const { setRightsTurn, setTurned } = useGlobalContext();
  const navigate = useNavigate();

  const updateViewportSetting = useCallback((key, value) => {
    setViewportSettings((previous) =>
      sanitizeViewportSettings({ ...previous, [key]: value }),
    );
  }, []);

  const resetViewportSettings = useCallback(() => {
    setViewportSettings(VIEWPORT_DEFAULTS);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--app-dead-top", `${viewportSettings.deadTop}px`);
    root.style.setProperty("--app-dead-right", `${viewportSettings.deadRight}px`);
    root.style.setProperty(
      "--app-dead-bottom",
      `${viewportSettings.deadBottom}px`,
    );
    root.style.setProperty("--app-dead-left", `${viewportSettings.deadLeft}px`);

    localStorage.setItem(VIEWPORT_STORAGE_KEY, JSON.stringify(viewportSettings));
  }, [viewportSettings]);

  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Escape":
          if (window.location.pathname !== "/") navigate(-1);
          break;
        case "c":
          setHideCursor((e) => !e);
          break;
        case "s":
          setRightsTurn((e) => !e);
          setTurned(true);
          break;
        case "F10":
          e.preventDefault();
          setShowViewportControls((current) => !current);
          break;
        default:
          break;
      }
    },
    [navigate, setRightsTurn, setTurned],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className={"App" + (hideCursor ? " hideCursor" : "")}>
      {showViewportControls ? (
        <div
          className="ViewportControls"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <h2 className="ViewportControls-title">Viewport Settings</h2>
          <p className="ViewportControls-hint">Toggle panel with F10</p>

          <label className="ViewportControls-field">
            <div className="ViewportControls-fieldHeader">
              <span>Dead Zone Top</span>
              <span>{viewportSettings.deadTop}px</span>
            </div>
            <input
              type="range"
              min={VIEWPORT_LIMITS.deadMin}
              max={VIEWPORT_LIMITS.deadMax}
              step="1"
              value={viewportSettings.deadTop}
              onChange={(event) =>
                updateViewportSetting("deadTop", event.target.value)
              }
            />
          </label>
          <label className="ViewportControls-field">
            <div className="ViewportControls-fieldHeader">
              <span>Dead Zone Right</span>
              <span>{viewportSettings.deadRight}px</span>
            </div>
            <input
              type="range"
              min={VIEWPORT_LIMITS.deadMin}
              max={VIEWPORT_LIMITS.deadMax}
              step="1"
              value={viewportSettings.deadRight}
              onChange={(event) =>
                updateViewportSetting("deadRight", event.target.value)
              }
            />
          </label>
          <label className="ViewportControls-field">
            <div className="ViewportControls-fieldHeader">
              <span>Dead Zone Bottom</span>
              <span>{viewportSettings.deadBottom}px</span>
            </div>
            <input
              type="range"
              min={VIEWPORT_LIMITS.deadMin}
              max={VIEWPORT_LIMITS.deadMax}
              step="1"
              value={viewportSettings.deadBottom}
              onChange={(event) =>
                updateViewportSetting("deadBottom", event.target.value)
              }
            />
          </label>
          <label className="ViewportControls-field">
            <div className="ViewportControls-fieldHeader">
              <span>Dead Zone Left</span>
              <span>{viewportSettings.deadLeft}px</span>
            </div>
            <input
              type="range"
              min={VIEWPORT_LIMITS.deadMin}
              max={VIEWPORT_LIMITS.deadMax}
              step="1"
              value={viewportSettings.deadLeft}
              onChange={(event) =>
                updateViewportSetting("deadLeft", event.target.value)
              }
            />
          </label>

          <div className="ViewportControls-actions">
            <button type="button" onClick={resetViewportSettings}>
              Reset
            </button>
            <button
              type="button"
              onClick={() => setShowViewportControls(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
      <div className="App-viewport">
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
    </div>
  );
}
