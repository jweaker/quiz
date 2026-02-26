import { motion } from "framer-motion";
import "./Question.css";
import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/boom.mp3";
import sourceAudioCorrect from "../assets/correct.mp3";
import sourceAudioWrong from "../assets/wrong.mp3";
import sourceAudioWhoosh from "../assets/whoosh.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
import { GiInfinity } from "react-icons/gi";

const DEBATE_TURN_DURATION = 100;
const DEBATE_TURN_COUNT = 2;
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];
const createPreloadedAudio = (source, options = {}) => {
  const sound = new Audio(source);
  sound.preload = "auto";
  sound.loop = options.loop ?? false;
  sound.volume = options.volume ?? 1;
  sound.playbackRate = options.playbackRate ?? 1;
  sound.load();
  return sound;
};

const TICK_AUDIO = createPreloadedAudio(sourceAudio, { loop: true, volume: 0.7 });
const BOOM_AUDIO = createPreloadedAudio(sourceAudio2, { volume: 1 });
const CORRECT_AUDIO = createPreloadedAudio(sourceAudioCorrect, { volume: 1 });
const WRONG_AUDIO = createPreloadedAudio(sourceAudioWrong, { volume: 1 });
const WHOOSH_AUDIO = createPreloadedAudio(sourceAudioWhoosh, { volume: 1 });

const stopAndResetSound = (sound) => {
  sound.pause();
  sound.currentTime = 0;
  sound.playbackRate = 1;
};

export default function Question() {
  const {
    rightsTurn,
    setLeftScore,
    setTurned,
    turned,
    setRightScore,
    setRightsTurn,
    DATA,
    setDATA,
  } = useGlobalContext();
  const params = useParams();
  const type = params.type;
  const navigate = useNavigate();

  // Local states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const id = params.id;
  const isMinefieldQuestion = type === "windows" && id === "misc";
  const [index, setIndex] = useState(parseInt(params.index ?? 0));
  const [zdone, setZdone] = useState(false);
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const mediaRef = useRef(null);

  // --- Poetic Chase: chess clock state ---
  const [leftMs, setLeftMs] = useState(100000);
  const [rightMs, setRightMs] = useState(100000);
  const [chessActive, setChessActive] = useState(null); // 'right' | 'left' | null
  const leftMsRef = useRef(100000);
  const rightMsRef = useRef(100000);
  const chessActiveRef = useRef(null);
  const chessIntervalRef = useRef(null);

  // --- Debate ("What if"): two sequential turns (one per team) ---
  const [debateTurn, setDebateTurn] = useState(0);

  // --- Quick Questions: phase A = first team, phase B = same questions for second team ---
  const [quickPhase, setQuickPhase] = useState("A");

  // Get current question data from DATA
  const currentWindow = DATA.parts[type]?.[id];
  const question = useMemo(
    () =>
      currentWindow
        ? Array.isArray(currentWindow)
          ? currentWindow[index]
          : type === "quickQuestions"
            ? currentWindow.questions[index]
            : currentWindow
        : (DATA.parts[type] ??
          (type === "poeticChase"
            ? { text: "المطاردة الشعرية", duration: 100 }
          : type === "askSmartly"
              ? {
                text: "اسأل بذكاء",
                duration: 120,
                file: "animals.png",
                mediaType: "image",
                isImage: true,
              }
              : {})),
    [currentWindow, DATA.parts, type, index],
  );
  const {
    text,
    duration: hduration,
    file: fileLoc,
    mediaType: rawMediaType,
    isImage,
    answer,
  } = question;
  const fileExtension = fileLoc?.split(".").pop()?.toLowerCase();
  const mediaType =
    rawMediaType ??
    (fileLoc
      ? AUDIO_EXTENSIONS.includes(fileExtension)
        ? "audio"
        : IMAGE_EXTENSIONS.includes(fileExtension)
          ? "image"
          : VIDEO_EXTENSIONS.includes(fileExtension)
            ? "video"
            : isImage
              ? "image"
              : "video"
      : null);
  const hasVisualMedia = Boolean(file) && mediaType !== "audio";
  const isAudioMedia = Boolean(file) && mediaType === "audio";

  // Set initial duration
  useEffect(() => {
    setDuration(
      type === "quickQuestions"
        ? 60
        : type === "debate"
          ? DEBATE_TURN_DURATION
          : hduration,
    );
  }, [hduration, type]);

  // Shared preloaded audio objects avoid re-init delays on each question route
  const audio = TICK_AUDIO;
  const audio2 = BOOM_AUDIO;
  const audioCorrect = CORRECT_AUDIO;
  const audioWrong = WRONG_AUDIO;

  const playSfx = useCallback((sound) => {
    sound.currentTime = 0;
    sound.play().catch(() => { });
  }, []);

  useEffect(() => {
    if (type === "puzzles") {
      setDATA((prevState) => {
        const newData = { ...prevState };
        newData.parts[type][id].done = !newData.parts[type][id].done;
        return newData;
      });
    } else if (type === "windows") {
      setDATA((prevState) => {
        const newData = { ...prevState };
        newData.parts[type][id][index].done = !newData.parts[type][id][index].done;
        return newData;
      });
    }
  }, [id, index, setDATA, type]);

  useEffect(() => {
    playSfx(WHOOSH_AUDIO);
  }, [playSfx]);

  const pauseAudio = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, [audio]);

  const stopAllSounds = useCallback(() => {
    [audio, audio2, audioCorrect, audioWrong, WHOOSH_AUDIO].forEach(
      stopAndResetSound,
    );

    const media = mediaRef.current;
    if (media) {
      media.pause();
      media.currentTime = 0;
    }
  }, [audio, audio2, audioCorrect, audioWrong]);

  const triggerComplete = useCallback(() => {
    setIsComplete(true);
    audio.volume = 1;
    audio.playbackRate = 1;
    audio.currentTime = 0;
    setTimeout(() => setIsComplete(false), 0);
  }, [audio]);

  // --- Chess clock helpers ---
  const clearChessTimer = useCallback(() => {
    if (chessIntervalRef.current) {
      clearInterval(chessIntervalRef.current);
      chessIntervalRef.current = null;
    }
  }, []);

  const startChessInterval = useCallback(
    (team) => {
      clearChessTimer();
      chessActiveRef.current = team;
      setChessActive(team);
      setRightsTurn(team === "right");
      setTurned(true);

      chessIntervalRef.current = setInterval(() => {
        const active = chessActiveRef.current;
        if (!active) return;

        if (active === "right") {
          rightMsRef.current = Math.max(0, rightMsRef.current - 100);
          setRightMs(rightMsRef.current);
          if (rightMsRef.current <= 0) {
            clearInterval(chessIntervalRef.current);
            chessIntervalRef.current = null;
            chessActiveRef.current = null;
            setChessActive(null);
            pauseAudio();
            const bonus = Math.round(leftMsRef.current / 5000);
            if (bonus > 0) setLeftScore((prev) => prev + bonus);
            setTurned(true);
          }
        } else {
          leftMsRef.current = Math.max(0, leftMsRef.current - 100);
          setLeftMs(leftMsRef.current);
          if (leftMsRef.current <= 0) {
            clearInterval(chessIntervalRef.current);
            chessIntervalRef.current = null;
            chessActiveRef.current = null;
            setChessActive(null);
            pauseAudio();
            const bonus = Math.round(rightMsRef.current / 5000);
            if (bonus > 0) setRightScore((prev) => prev + bonus);
            setTurned(true);
          }
        }
      }, 100);
    },
    [
      clearChessTimer,
      pauseAudio,
      setLeftScore,
      setRightScore,
      setRightsTurn,
      setTurned,
    ],
  );

  const switchChessClock = useCallback(() => {
    const current = chessActiveRef.current ?? (rightsTurn ? "right" : "left");
    const next = current === "right" ? "left" : "right";
    startChessInterval(next);
  }, [rightsTurn, startChessInterval]);

  // Cleanup chess timer on unmount
  useEffect(() => {
    return () => clearChessTimer();
  }, [clearChessTimer]);

  useEffect(() => {
    return () => stopAllSounds();
  }, [stopAllSounds]);

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key;
      switch (key) {
        case "Escape":
          if (type === "poeticChase") {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
          }
          pauseAudio();
          break;

        case "Enter":
          if (type === "poeticChase") {
            if (!isPlaying) {
              const startTeam = rightsTurn ? "right" : "left";
              startChessInterval(startTeam);
              audio.currentTime = 0;
              audio.play().catch(() => { });
              setIsPlaying(true);
            } else {
              clearChessTimer();
              chessActiveRef.current = null;
              setChessActive(null);
              pauseAudio();
            }
            break;
          }
          if (isPlaying) {
            pauseAudio();
          } else {
            if (type !== "speedQuestions" && type !== "audienceQuestions")
              audio.play().catch(() => { });
            setIsPlaying(true);
          }
          break;

        case "z":
        case "Z":
          if (type === "windows") {
            playSfx(audioCorrect);
          }
          setTurned(true);
          if (type === "askSmartly") {
            setRightsTurn((prev) => !prev);
            triggerComplete();
            setDuration(120);
            setIsComplete(true);
            setIsPlaying(false);
          } else if (type === "poeticChase") {
            if (rightsTurn) {
              setRightScore((prev) => prev + 1);
            } else {
              setLeftScore((prev) => prev + 1);
            }
            playSfx(audioCorrect);
            switchChessClock();
          } else if (type === "quickQuestions") {
            const totalSubQuestions =
              DATA.parts.quickQuestions[0].questions.length;
            if (index + 1 < totalSubQuestions) {
              setIndex((prev) => prev + 1);
              if (rightsTurn) setRightScore((prev) => prev + 1);
              else setLeftScore((prev) => prev + 1);
            } else {
              pauseAudio();
            }
            playSfx(audioCorrect);
            if (!zdone && index + 1 === totalSubQuestions) {
              if (rightsTurn) setRightScore((prev) => prev + 1);
              else setLeftScore((prev) => prev + 1);
              setZdone(true);
            }
          } else {
            pauseAudio();
            setIsComplete((prev) => !prev);
            if (type === "speedQuestions") setRightsTurn(false);
          }
          break;

        case "x":
        case "X":
          setTurned(true);
          if (type === "windows") {
            playSfx(audioWrong);
          }
          if (type === "askSmartly") {
            if (rightsTurn) setRightScore((prev) => prev - 1);
            else setLeftScore((prev) => prev - 1);
          } else if (type === "poeticChase") {
            if (rightsTurn) setLeftScore((prev) => prev + 1);
            else setRightScore((prev) => prev + 1);
            playSfx(audioWrong);
            switchChessClock();
          } else if (type === "quickQuestions") {
            const totalSubQuestions =
              DATA.parts.quickQuestions[0].questions.length;
            if (index + 1 < totalSubQuestions) {
              setIndex((prev) => prev + 1);
            } else {
              pauseAudio();
            }
            playSfx(audioWrong);
          } else {
            pauseAudio();
            setIsComplete((prev) => !prev);
            if (type === "speedQuestions") setRightsTurn(true);
          }
          break;

        case "c":
        case "C":
          if (type === "poeticChase") {
            switchChessClock();
          }
          break;

        case "1":
          if (type === "quickQuestions") {
            if (quickPhase === "A") {
              setQuickPhase("B");
              setIndex(0);
              setZdone(false);
              setRightsTurn((prev) => !prev);
              triggerComplete();
              setIsPlaying(false);
              setDuration(60);
            } else {
              pauseAudio();
              navigate(-1);
            }
          } else if (type === "debate") {
            if (debateTurn < DEBATE_TURN_COUNT - 1) {
              setDebateTurn((prev) => prev + 1);
              setRightsTurn((prev) => !prev);
              setTurned(true);
            }
            setDuration(DEBATE_TURN_DURATION);
            triggerComplete();
            setIsPlaying(false);
          } else {
            setDuration(hduration);
            triggerComplete();
            setIsPlaying(false);
          }
          break;

        case "e":
          if (["debate", "puzzles", "windows"].includes(type)) {
            stopAllSounds();
            navigate(`/rate/${type}`);
          }
          if (type === "poeticChase") {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
            pauseAudio();
            setTurned(true);
            const rightBonus = Math.round(rightMsRef.current / 5000);
            const leftBonus = Math.round(leftMsRef.current / 5000);
            if (rightBonus > 0) setRightScore((prev) => prev + rightBonus);
            if (leftBonus > 0) setLeftScore((prev) => prev + leftBonus);
          }
          if (type === "askSmartly") {
            if (rightsTurn) setRightScore((prev) => prev + 20);
            else setLeftScore((prev) => prev + 20);
          }
          break;

        case "m":
          if (type === "puzzles") {
            setDATA((prevState) => {
              const newData = { ...prevState };
              newData.parts[type][id].done = !question.done;
              return newData;
            });
          } else if (type === "windows") {
            setDATA((prevState) => {
              const newData = { ...prevState };
              newData.parts[type][id][index].done = !question.done;
              return newData;
            });
          }
          break;

        case "f":
          setShowOverlay((prev) => !prev);
          break;

        case "p":
        case "P": {
          const media = mediaRef.current;
          if (!media) break;
          if (media.paused) {
            media.play().catch(() => { });
          } else {
            media.pause();
          }
          break;
        }

        case "r":
        case "R": {
          const media = mediaRef.current;
          if (!media) break;
          media.currentTime = 0;
          media.play().catch(() => { });
          break;
        }

        default:
          break;
      }
    },
    [
      type,
      isPlaying,
      rightsTurn,
      index,
      id,
      zdone,
      DATA,
      question,
      navigate,
      pauseAudio,
      triggerComplete,
      setTurned,
      setRightsTurn,
      setRightScore,
      setLeftScore,
      setDATA,
      debateTurn,
      quickPhase,
      hduration,
      clearChessTimer,
      startChessInterval,
      switchChessClock,
      stopAllSounds,
      audio,
      audioCorrect,
      audioWrong,
      playSfx,
    ],
  );

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.7;
    audio2.volume = 1;
    audioCorrect.volume = 1;
    audioWrong.volume = 1;

    if (fileLoc) {
      (async () => {
        try {
          const importedFile = await import(`../assets/${fileLoc}`);
          setFile(importedFile.default);
        } catch (err) {
          setFile(null);
          console.log(err);
        }
      })();
    } else {
      setFile(null);
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    audio,
    audio2,
    audioCorrect,
    audioWrong,
    fileLoc,
    handleKeyDown,
  ]);

  const formatChessTime = (ms) => Math.ceil(ms / 1000);
  const timerColors = isMinefieldQuestion
    ? ["#F2A572", "#E77B5D", "#D65A50", "#B53F45"]
    : ["#F0C75E", "#D4A853", "#E74C3C", "#C0392B"];
  const timerTrailColor = isMinefieldQuestion
    ? "rgba(214, 90, 80, 0.24)"
    : "rgba(255, 248, 231, 0.2)";

  return (
    <motion.div
      className={"Question" + (isMinefieldQuestion ? " Question-danger" : "")}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {type !== "audienceQuestions" && (
        <>
          <Score
            zero={
              type === "poeticChase" ||
              type === "askSmartly" ||
              type === "quickQuestions"
            }
            overlay={showOverlay && hasVisualMedia}
            right
            turn={rightsTurn && turned}
          />
          <Score
            zero={
              type === "poeticChase" ||
              type === "askSmartly" ||
              type === "quickQuestions"
            }
            overlay={showOverlay && hasVisualMedia}
            turn={!rightsTurn && turned}
          />
        </>
      )}
      <h1
        className={
          "Question-title" +
          (isMinefieldQuestion ? " Question-title-danger" : "") +
          (["poeticChase", "debate", "askSmartly"].includes(type) ||
            (["quickQuestions", "speedQuestions"].includes(type) && !isPlaying)
            ? " Question-title-6"
            : "") +
          (showOverlay && hasVisualMedia ? " Question-title-overlay" : "")
        }
      >
        {!isPlaying
          ? type === "quickQuestions"
            ? DATA.parts.quickQuestions[0].title
            : type === "speedQuestions"
              ? "سؤال السرعة"
              : text
          : text}
      </h1>
      {isAudioMedia && file && (
        <audio
          ref={mediaRef}
          className="Question-audio-hidden"
          src={file}
          preload="auto"
        />
      )}
      <div
        className={
          "Question-timer-container" +
          (isMinefieldQuestion ? " Question-timer-container-danger" : "") +
          (isComplete && type !== "debate"
            ? " Question-timer-container-complete"
            : "") +
          (showOverlay && hasVisualMedia ? " Question-timer-container-overlay" : "") +
          (type === "poeticChase" ? " Question-timer-container-chess" : "")
        }
      >
        {isComplete ? (
          type !== "debate" &&
          type !== "poeticChase" &&
          type !== "askSmartly" && (
            <motion.h1
              className="Question-answer"
              key={"answer-" + answer}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {answer}
            </motion.h1>
          )
        ) : type === "speedQuestions" || type === "audienceQuestions" ? (
          <GiInfinity size={500} className="infinity" />
        ) : type === "poeticChase" ? (
          <div className="chess-clock-display">
            <div className="chess-clock-clocks">
              <div
                className={
                  "chess-clock-team" +
                  (chessActive === "left" ? " chess-clock-active" : "")
                }
              >
                <span className="chess-clock-time">
                  {formatChessTime(leftMs)}
                </span>
              </div>
              <div
                className={
                  "chess-clock-team" +
                  (chessActive === "right" ? " chess-clock-active" : "")
                }
              >
                <span className="chess-clock-time">
                  {formatChessTime(rightMs)}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={duration}
            colors={timerColors}
            colorsTime={[duration, duration / 2, 5, 0]}
            trailColor={timerTrailColor}
            strokeWidth={20}
            trailStrokeWidth={25}
            size={600}
            onUpdate={(remaining) => {
              if (remaining === 14) audio.currentTime = 0;
              audio.playbackRate =
                duration === 0
                  ? 0
                  : remaining <= 15
                    ? 2 - (remaining + duration - 15) / duration
                    : 0.75;
              audio.volume = 1;
            }}
            onComplete={() => {
              pauseAudio();
              playSfx(audio2);
            }}
          >
            {({ remainingTime }) => (
              <span className="Question-timer">{remainingTime}</span>
            )}
          </CountdownCircleTimer>
        )}
      </div>
      <div
        className={
          "Question-overlay" +
          (showOverlay && hasVisualMedia ? " Question-overlay-visible" : "")
        }
      >
        {mediaType === "image" && file && (
          <img className="Question-overlay-image" src={file} alt="question" />
        )}
        {mediaType === "video" && file && showOverlay && (
          <video
            ref={mediaRef}
            src={file}
            className="Question-overlay-image"
            autoPlay
            loop
            playsInline
          />
        )}
      </div>
    </motion.div>
  );
}
