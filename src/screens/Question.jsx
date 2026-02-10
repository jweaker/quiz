import "./Question.css";
import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/boom.mp3";
import sourceAudioCorrect from "../assets/correct.mp3";
import sourceAudioWrong from "../assets/wrong.mp3";
import sourceAudioWhoosh from "../assets/whoosh.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useState } from "react";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
import { GiInfinity } from "react-icons/gi";

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
  const [leftWrong, setLeftWrong] = useState(0);
  const [rightWrong, setRightWrong] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

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
        ? { text: "المطاردة الشعرية", duration: 15 }
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

  // Set initial duration from the question data
  useEffect(() => {
    setDuration(hduration);
  }, [hduration]);

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

  // Helper to pause audio and update playing state
  const pauseAudio = useCallback(() => {
    audio.pause();
    setIsPlaying(false);
  }, [audio]);

  // Helper to trigger "complete" state and reset audio properties
  const triggerComplete = useCallback(() => {
    setIsComplete(true);
    audio.volume = 1;
    audio.playbackRate = 1;
    audio.currentTime = 0;
    setTimeout(() => setIsComplete(false), 0);
  }, [audio]);

  const handleKeyDown = useCallback(
    (e) => {
      const key = e.key;
      switch (key) {
        case "Escape":
          pauseAudio();
          break;
        case "Enter":
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
            setDuration(15);
            setRightsTurn((prev) => !prev);
            audioCorrect.play();
            triggerComplete();
          } else if (type === "quickQuestions") {
            const totalSubQuestions =
              DATA.parts.quickQuestions[id].questions.length;
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
            if (rightsTurn) {
              setRightWrong((prev) => prev + 1);
              setRightScore((prev) => prev - 5);
            } else {
              setLeftWrong((prev) => prev + 1);
              setLeftScore((prev) => prev - 5);
            }
            setRightsTurn((prev) => !prev);
            setDuration(15);
            triggerComplete();
            audioWrong.play();
          } else if (type === "quickQuestions") {
            const totalSubQuestions =
              DATA.parts.quickQuestions[id].questions.length;
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
        case "1":
          if (type === "quickQuestions") {
            const totalSets = DATA.parts.quickQuestions.questions.length;
            if (id < totalSets) {
              setId((prev) => prev + 1);
              setRightsTurn((prev) => !prev);
            }
            setIndex(0);
            setZdone(false);
            triggerComplete();
            setIsPlaying(false);
          } else {
            setDuration(type === "debate" ? 60 : hduration);
            triggerComplete();
            setIsPlaying(false);
          }
          break;
        case "e":
          if (["debate", "puzzles", "windows"].includes(type)) {
            navigate(`/rate/${type}`);
          }
          if (type === "poeticChase") {
            setRightScore((prev) => prev + 15);
            setLeftScore((prev) => prev + 15);
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
      leftWrong,
      rightWrong,
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
    ],
  );

  useEffect(() => {
    // Configure audio defaults
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

  return (
    <div className="Question">
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
            ? DATA.parts.quickQuestions[id].title
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
          (showOverlay && file ? " Question-timer-container-overlay" : "")
        }
      >
        {isComplete ? (
          type !== "debate" &&
          type !== "poeticChase" &&
          type !== "askSmartly" && <h1 className="Question-answer">{answer}</h1>
        ) : type === "speedQuestions" || type === "audienceQuestions" ? (
          <GiInfinity size={500} color="white" className="infinity" />
        ) : (
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={duration}
            colors={["#00ff00", "#ffff01", "#A30000", "#A30000"]}
            colorsTime={[duration, duration / 2, 5, 0]}
            trailColor="white"
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
    </div>
  );
}
