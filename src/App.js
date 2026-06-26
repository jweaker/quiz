import { useCallback, useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./App.css";
import { useGlobalContext } from "./contexts/Global";
import sourceAudioClap from "./assets/shortcut_clap.mp3";
import sourceAudioDisappointedAudience from "./assets/shortcut_disappointed_audience.mp3";
import sourceAudioWhoo from "./assets/shortcut_whoo.mp3";
import Home from "./screens/Home";
import Question from "./screens/Question";
import QuestionPicker from "./screens/QuestionPicker";
import Rate from "./screens/Rate";
import Windows from "./screens/Windows";
import Finale from "./screens/Finale";
import RamadanBackground from "./components/RamadanBackground";

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

const isEditableElement = (target) =>
  target instanceof HTMLElement &&
  (target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT" ||
    target.isContentEditable);

const createPreloadedAudio = (source, options = {}) => {
  const sound = new Audio(source);
  sound.preload = "auto";
  sound.volume = options.volume ?? 1;
  sound.playbackRate = options.playbackRate ?? 1;
  sound.load();
  return sound;
};

const APPLAUSE_AUDIO = createPreloadedAudio(sourceAudioClap, {
  volume: 1,
  playbackRate: 1.12,
});
const WHOO_AUDIO = createPreloadedAudio(sourceAudioWhoo, { volume: 1 });
const DISAPPOINTMENT_AUDIO = createPreloadedAudio(
  sourceAudioDisappointedAudience,
  {
    volume: 0.95,
  },
);

const playOneShot = (sound) => {
  sound.pause();
  sound.currentTime = 0;
  sound.play().catch(() => {});
};

export default function App() {
  const [hideCursor, setHideCursor] = useState(false);
  const [showViewportControls, setShowViewportControls] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [viewportSettings, setViewportSettings] = useState(
    getStoredViewportSettings,
  );
  const { setRightsTurn, setTurned } = useGlobalContext();
  const navigate = useNavigate();
  const location = useLocation();
  const routeParts = useMemo(
    () => location.pathname.split("/").filter(Boolean),
    [location.pathname],
  );
  const currentRoute = routeParts[0] ?? "home";
  const questionType = currentRoute === "question" ? routeParts[1] : null;

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
      const editable = isEditableElement(e.target);
      switch (e.key) {
        case "Escape":
          if (e.repeat) break;
          e.preventDefault();
          if (showViewportControls) {
            setShowViewportControls(false);
            break;
          }
          if (showShortcutHelp) {
            setShowShortcutHelp(false);
            break;
          }
          if (location.pathname !== "/") navigate(-1);
          break;
        case "u":
        case "U":
          if (editable) break;
          setHideCursor((e) => !e);
          break;
        case "s":
        case "S":
          if (editable) break;
          setRightsTurn((e) => !e);
          setTurned(true);
          break;
        case "v":
        case "V":
          if (editable) break;
          e.preventDefault();
          setShowViewportControls((current) => !current);
          break;
        case "h":
        case "H":
          if (editable) break;
          setShowShortcutHelp((current) => !current);
          break;
        case "a":
        case "A":
          if (editable || e.repeat) break;
          e.preventDefault();
          playOneShot(APPLAUSE_AUDIO);
          window.setTimeout(() => playOneShot(WHOO_AUDIO), 240);
          break;
        case "b":
        case "B":
          if (editable || e.repeat) break;
          e.preventDefault();
          playOneShot(DISAPPOINTMENT_AUDIO);
          break;
        default:
          break;
      }
    },
    [
      navigate,
      location.pathname,
      setRightsTurn,
      setTurned,
      showViewportControls,
      showShortcutHelp,
    ],
  );

  const shortcutSections = useMemo(() => {
    const sections = [
      {
        title: "Global",
        rows: [
          { keys: "Esc", action: "Back" },
          { keys: "S", action: "Switch team turn" },
          { keys: "H", action: "Show/hide cheat sheet" },
          { keys: "V", action: "Show/hide viewport settings" },
          { keys: "U", action: "Show/hide cursor" },
          { keys: "A", action: "Play clap + whoo" },
          { keys: "B", action: "Play boo" },
        ],
      },
    ];

    if (currentRoute === "home") {
      sections.push({
        title: "Home",
        rows: [
          { keys: "1..8", action: "Select mode" },
          { keys: "Same number again", action: "Open selected mode" },
          { keys: "0 / F", action: "Open finale page" },
        ],
      });
    } else if (currentRoute === "windows") {
      sections.push({
        title: "Windows",
        rows: [
          { keys: "1..5", action: "Select category" },
          { keys: "Same number again", action: "Open category" },
        ],
      });
    } else if (currentRoute === "questionpicker") {
      sections.push({
        title: "Question Picker",
        rows: [
          { keys: "1..N", action: "Select question" },
          { keys: "Same number again", action: "Open question" },
        ],
      });
    } else if (currentRoute === "question") {
      const rows = [
        { keys: "Enter", action: "Start/pause timer" },
        { keys: "Z", action: "Correct / advance" },
        { keys: "X", action: "Wrong / advance" },
        { keys: "N", action: "Next question/set" },
        { keys: "1", action: "Next round / reset / phase change" },
        { keys: "E", action: "Rating/finalize action" },
        { keys: "F", action: "Show/hide media overlay" },
        { keys: "P", action: "Play/pause media (audio/video)" },
        { keys: "R", action: "Restart media (audio/video)" },
      ];
      if (questionType === "poeticChase") {
        rows.push({ keys: "C", action: "Switch active clock/team" });
      }
      if (questionType === "windows") {
        rows.push({ keys: "C", action: "Show answer (no sound)" });
      }
      if (questionType === "puzzles" || questionType === "windows") {
        rows.push({ keys: "M", action: "Toggle done state" });
      }
      sections.push({ title: "Question", rows });
    } else if (currentRoute === "rate") {
      sections.push({
        title: "Rate",
        rows: [
          { keys: "Enter", action: "Apply score and continue" },
          { keys: "Tab", action: "Move between inputs" },
        ],
      });
    }

    return sections;
  }, [currentRoute, questionType]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [handleKeyDown]);
  return (
    <div className={"App" + (hideCursor ? " hideCursor" : "")}>
      <RamadanBackground />
      {showViewportControls ? (
        <div
          className="ViewportControls"
          onKeyDown={(event) => event.stopPropagation()}
        >
          <h2 className="ViewportControls-title">Viewport Settings</h2>
          <p className="ViewportControls-hint">Toggle panel with V</p>

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
      {showShortcutHelp ? (
        <div className="ShortcutHelp" onKeyDown={(event) => event.stopPropagation()}>
          <h2 className="ShortcutHelp-title">Cheat Sheet</h2>
          <p className="ShortcutHelp-hint">Toggle with H</p>
          {shortcutSections.map((section) => (
            <div className="ShortcutHelp-section" key={section.title}>
              <h3>{section.title}</h3>
              {section.rows.map((row) => (
                <div className="ShortcutHelp-row" key={row.keys + row.action}>
                  <span>{row.keys}</span>
                  <span>{row.action}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : null}
      <div className="App-viewport">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="windows" element={<Windows />} />
            <Route path="questionpicker/:id" element={<QuestionPicker />} />
            <Route path="question/:type/:id/:index" element={<Question />} />
            <Route path="question/:type/:id" element={<Question />} />
            <Route path="question/:type" element={<Question />} />
            <Route path="rate/:type" element={<Rate />} />
            <Route path="finale" element={<Finale />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  );
}
