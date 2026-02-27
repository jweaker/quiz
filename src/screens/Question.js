import { motion } from "framer-motion";
import "./Question.css";
import { useNavigate, useParams } from "react-router-dom";
import sourceAudioTimer from "../assets/timer_tick_freesound.mp3";
import sourceAudioChess from "../assets/ticking.mp3";
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
const POETIC_CHASE_TURN_DURATION_SECONDS = 90;
const POETIC_CHASE_TURN_DURATION_MS = POETIC_CHASE_TURN_DURATION_SECONDS * 1000;
const AUDIO_EXTENSIONS = ["mp3", "wav", "ogg", "m4a", "aac", "flac"];
const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"];
const VIDEO_EXTENSIONS = ["mp4", "webm", "mov", "m4v", "ogv"];
const TIMER_TICK_START_OFFSET = 0;
const TIMER_TICK_VOLUME = 0.96;
const CHESS_TICK_VOLUME = 0.75;
const createPreloadedAudio = (source, options = {}) => {
  const sound = new Audio(source);
  sound.preload = "auto";
  sound.loop = options.loop ?? false;
  sound.volume = options.volume ?? 1;
  sound.playbackRate = options.playbackRate ?? 1;
  sound.load();
  return sound;
};

const TIMER_TICK_AUDIO = createPreloadedAudio(sourceAudioTimer, {
  loop: false,
  volume: TIMER_TICK_VOLUME,
});
const CHESS_TICK_AUDIO = createPreloadedAudio(sourceAudioChess, {
  loop: true,
  volume: CHESS_TICK_VOLUME,
});
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
  const isArtsLiteratureFirstQuestion =
    type === "windows" && id === "arts" && params.index === "0";
  const [index, setIndex] = useState(parseInt(params.index ?? 0));
  const [zdone, setZdone] = useState(false);
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const mediaRef = useRef(null);
  const lastTimerSecondRef = useRef(null);

  // --- Poetic Chase: chess clock state ---
  const [leftMs, setLeftMs] = useState(POETIC_CHASE_TURN_DURATION_MS);
  const [rightMs, setRightMs] = useState(POETIC_CHASE_TURN_DURATION_MS);
  const [chessActive, setChessActive] = useState(null); // 'right' | 'left' | null
  const leftMsRef = useRef(POETIC_CHASE_TURN_DURATION_MS);
  const rightMsRef = useRef(POETIC_CHASE_TURN_DURATION_MS);
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
            ? {
              text: "المطاردة الشعرية",
              duration: POETIC_CHASE_TURN_DURATION_SECONDS,
            }
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
  const quickSubQuestionsCount = Array.isArray(currentWindow?.questions)
    ? currentWindow.questions.length
    : 0;
  const quickSetTitle = currentWindow?.title ?? DATA.parts.quickQuestions?.[0]?.title;

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
  const timerAudio = TIMER_TICK_AUDIO;
  const chessAudio = CHESS_TICK_AUDIO;
  const audio = type === "poeticChase" ? chessAudio : timerAudio;
  const audio2 = BOOM_AUDIO;
  const audioCorrect = CORRECT_AUDIO;
  const audioWrong = WRONG_AUDIO;

  const playSfx = useCallback((sound) => {
    sound.currentTime = 0;
    sound.play().catch(() => { });
  }, []);

  const playTimerTick = useCallback(
    (urgent = false) => {
      if (isVideoPlaying) return;
      timerAudio.loop = false;
      timerAudio.pause();
      timerAudio.currentTime = TIMER_TICK_START_OFFSET;
      timerAudio.playbackRate = urgent ? 1.04 : 1;
      timerAudio.volume = urgent ? 1 : TIMER_TICK_VOLUME;
      timerAudio.play().catch(() => { });
    },
    [isVideoPlaying, timerAudio],
  );

  const resetTimerTickSync = useCallback(() => {
    lastTimerSecondRef.current = null;
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
    [timerAudio, chessAudio, audio2, audioCorrect, audioWrong, WHOOSH_AUDIO].forEach(
      stopAndResetSound,
    );

    const media = mediaRef.current;
    if (media) {
      media.pause();
      media.currentTime = 0;
    }
  }, [timerAudio, chessAudio, audio2, audioCorrect, audioWrong]);

  const triggerComplete = useCallback(() => {
    setIsComplete(true);
    audio.volume = 1;
    audio.playbackRate = 1;
    audio.currentTime = 0;
    resetTimerTickSync();
    setTimeout(() => setIsComplete(false), 0);
  }, [audio, resetTimerTickSync]);

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

  const goToNextQuestion = useCallback(() => {
    if (
      !["quickQuestions", "puzzles", "speedQuestions", "audienceQuestions"].includes(
        type,
      )
    ) {
      return;
    }

    const section = DATA.parts[type];
    if (!Array.isArray(section) || section.length === 0) {
      return;
    }

    const currentId = Number.parseInt(id ?? "0", 10);
    const normalizedId = Number.isNaN(currentId) ? 0 : currentId;
    const nextId = (normalizedId + 1) % section.length;

    setIsPlaying(false);
    setIsComplete(false);
    pauseAudio();
    resetTimerTickSync();

    if (type === "quickQuestions") {
      setIndex(0);
      setQuickPhase("A");
      setZdone(false);
      setDuration(60);
    }

    navigate(`/question/${type}/${nextId}`, { replace: true });
  }, [DATA.parts, id, navigate, pauseAudio, resetTimerTickSync, type]);

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
              audio.loop = true;
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
            if (type !== "speedQuestions" && type !== "audienceQuestions") {
              audio.loop = false;
              resetTimerTickSync();
            }
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
            const totalSubQuestions = quickSubQuestionsCount;
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
            const totalSubQuestions = quickSubQuestionsCount;
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
          } else if (type === "windows") {
            setTurned(true);
            pauseAudio();
            setIsComplete((prev) => !prev);
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

        case "n":
        case "N":
          goToNextQuestion();
          break;

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
      quickSubQuestionsCount,
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
      resetTimerTickSync,
      goToNextQuestion,
    ],
  );

  useEffect(() => {
    timerAudio.loop = false;
    timerAudio.volume = TIMER_TICK_VOLUME;
    chessAudio.loop = true;
    chessAudio.volume = CHESS_TICK_VOLUME;
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
    timerAudio,
    chessAudio,
    audio2,
    audioCorrect,
    audioWrong,
    fileLoc,
    handleKeyDown,
  ]);

  useEffect(() => {
    if (!isPlaying) {
      resetTimerTickSync();
    }
  }, [isPlaying, resetTimerTickSync]);

  useEffect(() => {
    if (!isPlaying) return;
    if (type === "poeticChase") return;
    if (type === "speedQuestions" || type === "audienceQuestions") return;
    if (isVideoPlaying) return;
    playTimerTick(false);
  }, [isPlaying, type, isVideoPlaying, playTimerTick]);

  useEffect(() => {
    if (mediaType === "video" && showOverlay && file) return;
    setIsVideoPlaying(false);
  }, [mediaType, showOverlay, file]);

  const handleVideoPlay = useCallback(() => {
    setIsVideoPlaying(true);
    timerAudio.pause();
    chessAudio.pause();
  }, [timerAudio, chessAudio]);

  const handleVideoPause = useCallback(() => {
    setIsVideoPlaying(false);
  }, []);

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
          (isArtsLiteratureFirstQuestion ? " Question-title-left" : "") +
          (["poeticChase", "debate", "askSmartly"].includes(type) ||
            (["quickQuestions", "speedQuestions"].includes(type) && !isPlaying)
            ? " Question-title-6"
            : "") +
          (showOverlay && hasVisualMedia ? " Question-title-overlay" : "")
        }
      >
        {!isPlaying
          ? type === "quickQuestions"
            ? quickSetTitle
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
              if (!isPlaying) return;
              const second = Math.ceil(remaining);
              if (second <= 0) return;
              if (lastTimerSecondRef.current === null) {
                lastTimerSecondRef.current = second;
                return;
              }
              if (second === lastTimerSecondRef.current) return;

              playTimerTick(second <= 5);
              lastTimerSecondRef.current = second;
            }}
            onComplete={() => {
              pauseAudio();
              resetTimerTickSync();
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
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onEnded={handleVideoPause}
          />
        )}
      </div>
    </motion.div>
  );
}
