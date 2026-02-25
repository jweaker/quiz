import { motion } from "framer-motion";
import "./Question.css";
import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/boom.mp3";
import sourceAudioCorrect from "../assets/correct.mp3";
import sourceAudioWrong from "../assets/wrong.mp3";
import sourceAudioWhoosh from "../assets/whoosh.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useRef, useState } from "react";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
import { GiInfinity } from "react-icons/gi";

// Debate turn durations: [team A turn 1, team B turn 1, team A turn 2, team B turn 2]
const DEBATE_DURATIONS = [60, 60, 40, 40];

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
  const [id, setId] = useState(params.id);
  const [index, setIndex] = useState(parseInt(params.index ?? 0));
  const [zdone, setZdone] = useState(false);
  const [file, setFile] = useState(null);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  // --- Poetic Chase: chess clock state ---
  const [leftMs, setLeftMs] = useState(100000);
  const [rightMs, setRightMs] = useState(100000);
  const [chessActive, setChessActive] = useState(null); // 'right' | 'left' | null
  const leftMsRef = useRef(100000);
  const rightMsRef = useRef(100000);
  const chessActiveRef = useRef(null);
  const chessIntervalRef = useRef(null);

  // --- Debate: track which round we're on (0-3) ---
  const [debateRound, setDebateRound] = useState(0);

  // --- Quick Questions: phase A = first team, phase B = same questions for second team ---
  const [quickPhase, setQuickPhase] = useState("A");

  // Get current question data from DATA
  const currentWindow = DATA.parts[type]?.[id];
  const question = currentWindow
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
            isImage: true,
          }
          : {}));
  const {
    text,
    duration: hduration,
    file: fileLoc,
    isImage,
    answer,
  } = question;

  // Set initial duration
  useEffect(() => {
    setDuration(type === "quickQuestions" ? 60 : hduration);
  }, [hduration, type]);

  useEffect(() => {
    try {
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
      audioWhoosh.play();
    } catch { }
  }, []);

  // Initialize audio elements
  const [audio] = useState(new Audio(sourceAudio));
  const [audio2] = useState(new Audio(sourceAudio2));
  const [audioCorrect] = useState(new Audio(sourceAudioCorrect));
  const [audioWrong] = useState(new Audio(sourceAudioWrong));
  const [audioWhoosh] = useState(new Audio(sourceAudioWhoosh));

  const pauseAudio = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, [audio]);

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
            setIsPlaying(false);
            const bonus = Math.floor(leftMsRef.current / 5000);
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
            setIsPlaying(false);
            const bonus = Math.floor(rightMsRef.current / 5000);
            if (bonus > 0) setRightScore((prev) => prev + bonus);
            setTurned(true);
          }
        }
      }, 100);
    },
    [clearChessTimer, setLeftScore, setRightScore, setTurned],
  );

  const switchChessClock = useCallback(() => {
    const next = chessActiveRef.current === "right" ? "left" : "right";
    startChessInterval(next);
  }, [startChessInterval]);

  // Cleanup chess timer on unmount
  useEffect(() => {
    return () => clearChessTimer();
  }, [clearChessTimer]);

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
              setIsPlaying(true);
            } else {
              clearChessTimer();
              chessActiveRef.current = null;
              setChessActive(null);
              setIsPlaying(false);
            }
            break;
          }
          if (isPlaying) {
            pauseAudio();
          } else {
            if (type !== "speedQuestions" && type !== "audienceQuestions")
              audio.play();
            setIsPlaying(true);
          }
          break;

        case "z":
        case "Z":
          if (type === "windows") {
            audioCorrect.play();
          }
          setTurned(true);
          if (type === "askSmartly") {
            setRightsTurn((prev) => !prev);
            triggerComplete();
            setDuration(120);
            setIsComplete(true);
            setIsPlaying(false);
          } else if (type === "poeticChase") {
            if (chessActiveRef.current === "right") {
              setRightScore((prev) => prev + 1);
            } else {
              setLeftScore((prev) => prev + 1);
            }
            audioCorrect.play();
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
            audioCorrect.play();
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
            audioWrong.play();
          }
          if (type === "askSmartly") {
            if (rightsTurn) setRightScore((prev) => prev - 1);
            else setLeftScore((prev) => prev - 1);
          } else if (type === "poeticChase") {
            audioWrong.play();
            switchChessClock();
          } else if (type === "quickQuestions") {
            const totalSubQuestions =
              DATA.parts.quickQuestions[0].questions.length;
            if (index + 1 < totalSubQuestions) {
              setIndex((prev) => prev + 1);
            } else {
              pauseAudio();
            }
            audioWrong.play();
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
            const nextRound = Math.min(debateRound + 1, 3);
            setDebateRound(nextRound);
            setDuration(DEBATE_DURATIONS[nextRound]);
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
            navigate(`/rate/${type}`);
          }
          if (type === "poeticChase") {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
            setIsPlaying(false);
            setTurned(true);
            const rightBonus = Math.floor(rightMsRef.current / 5000);
            const leftBonus = Math.floor(leftMsRef.current / 5000);
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
      debateRound,
      quickPhase,
      hduration,
      clearChessTimer,
      startChessInterval,
      switchChessClock,
      audio,
      audioCorrect,
      audioWrong,
    ],
  );

  useEffect(() => {
    audio.loop = true;
    audio.volume = 0.7;
    audio2.volume = 1;
    audioCorrect.volume = 1;
    audioWrong.volume = 1;

    if (fileLoc)
      (async () => {
        try {
          const importedFile = await import(`../assets/${fileLoc}`);
          setFile(importedFile.default);
        } catch (err) {
          console.log(err);
        }
      })();

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [audio, audio2, audioCorrect, audioWrong, fileLoc, handleKeyDown]);

  const formatChessTime = (ms) => Math.ceil(ms / 1000);

  return (
    <motion.div
      className="Question"
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
            overlay={showOverlay && file}
            right
            turn={rightsTurn && turned}
          />
          <Score
            zero={
              type === "poeticChase" ||
              type === "askSmartly" ||
              type === "quickQuestions"
            }
            overlay={showOverlay && file}
            turn={!rightsTurn && turned}
          />
        </>
      )}
      <h1
        className={
          "Question-title" +
          (["poeticChase", "debate", "askSmartly"].includes(type) ||
            (["quickQuestions", "speedQuestions"].includes(type) && !isPlaying)
            ? " Question-title-6"
            : "") +
          (showOverlay && file ? " Question-title-overlay" : "")
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
      <div
        className={
          "Question-timer-container" +
          (isComplete && type !== "debate"
            ? " Question-timer-container-complete"
            : "") +
          (showOverlay && file ? " Question-timer-container-overlay" : "") +
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
                  (chessActive === "right" ? " chess-clock-active" : "")
                }
              >
                <span className="chess-clock-time">
                  {formatChessTime(rightMs)}
                </span>
              </div>
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
            </div>
          </div>
        ) : (
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={duration}
            colors={["#F0C75E", "#D4A853", "#E74C3C", "#C0392B"]}
            colorsTime={[duration, duration / 2, 5, 0]}
            trailColor="rgba(255, 248, 231, 0.2)"
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
              audio2.play();
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
          (showOverlay && file ? " Question-overlay-visible" : "")
        }
      >
        {isImage ? (
          <img className="Question-overlay-image" src={file} alt="question" />
        ) : (
          file &&
          showOverlay && (
            <video
              src={file}
              className="Question-overlay-image"
              autoPlay
              loop
            />
          )
        )}
      </div>
    </motion.div>
  );
}
