import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/boom.mp3";
import sourceAudioCorrect from "../assets/correct.mp3";
import sourceAudioWrong from "../assets/wrong.mp3";
import sourceAudioWhoosh from "../assets/whoosh.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useState } from "react";
import Score from "../components/Score";
import { useShowStore } from "../state";
import { GiInfinity } from "react-icons/gi";

export default function Question() {
  const rightsTurn = useShowStore((state) => state.rightsTurn);
  const turned = useShowStore((state) => state.turned);
  const data = useShowStore((state) => state.data);
  const setRightsTurn = useShowStore((state) => state.setRightsTurn);
  const setTurned = useShowStore((state) => state.setTurned);
  const addRightScore = useShowStore((state) => state.addRightScore);
  const addLeftScore = useShowStore((state) => state.addLeftScore);
  const updateData = useShowStore((state) => state.updateData);
  const params = useParams<{ type: string; id: string; index: string }>();
  const type = params.type!;
  const navigate = useNavigate();

  // Local states
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [id, setId] = useState<string | number>(params.id ?? "");
  const [index, setIndex] = useState<number>(parseInt(params.index ?? "0"));
  const [zdone, setZdone] = useState<boolean>(false);
  const [file, setFile] = useState<string | null>(null);
  const [leftWrong, setLeftWrong] = useState<number>(0);
  const [rightWrong, setRightWrong] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [showOverlay, setShowOverlay] = useState<boolean>(false);

  if (!data) return null;
  const DATA = data;

  // Get current question data from DATA
  const currentWindow = (DATA.parts[type] as Record<string, unknown>)?.[
    id as string
  ];
  const question: {
    text?: string;
    duration?: number;
    file?: string;
    isImage?: boolean;
    answer?: string;
    done?: boolean;
  } = currentWindow
    ? Array.isArray(currentWindow)
      ? (currentWindow[index] as {
          text?: string;
          duration?: number;
          file?: string;
          isImage?: boolean;
          answer?: string;
          done?: boolean;
        })
      : type === "quickQuestions"
        ? ((
            currentWindow as { questions: Array<{ text?: string; duration?: number; file?: string; isImage?: boolean; answer?: string; done?: boolean }> }
          ).questions[index] as {
            text?: string;
            duration?: number;
            file?: string;
            isImage?: boolean;
            answer?: string;
            done?: boolean;
          })
        : (currentWindow as {
            text?: string;
            duration?: number;
            file?: string;
            isImage?: boolean;
            answer?: string;
            done?: boolean;
          })
    : ((DATA.parts[type] as {
        text?: string;
        duration?: number;
        file?: string;
        isImage?: boolean;
        answer?: string;
        done?: boolean;
      }) ??
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
    setDuration(hduration ?? 0);
  }, [hduration]);

  useEffect(() => {
    try {
      if (type === "puzzles") {
        updateData((prevState) => {
          const newData = { ...prevState };
          const puzzles = newData.parts[type] as Array<{ done?: boolean }>;
          const puzzle = puzzles[id as unknown as number];
          if (puzzle) puzzle.done = !question.done;
          return newData;
        });
      } else if (type === "windows") {
        updateData((prevState) => {
          const newData = { ...prevState };
          const windows = newData.parts[type] as Record<
            string,
            Array<{ done?: boolean }>
          >;
          const windowCategory = windows[id as string];
          if (windowCategory?.[index]) {
            windowCategory[index].done = !question.done;
          }
          return newData;
        });
      }
      audioWhoosh.play();
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize audio elements
  const [audio] = useState<HTMLAudioElement>(new Audio(sourceAudio));
  const [audio2] = useState<HTMLAudioElement>(new Audio(sourceAudio2));
  const [audioCorrect] = useState<HTMLAudioElement>(
    new Audio(sourceAudioCorrect),
  );
  const [audioWrong] = useState<HTMLAudioElement>(new Audio(sourceAudioWrong));
  const [audioWhoosh] = useState<HTMLAudioElement>(
    new Audio(sourceAudioWhoosh),
  );

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
    (e: KeyboardEvent) => {
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
            setRightsTurn(!rightsTurn);
            triggerComplete();
            setDuration(120);
            setIsComplete(true);
            setIsPlaying(false);
          } else if (type === "poeticChase") {
            setDuration(15);
            setRightsTurn(!rightsTurn);
            audioCorrect.play();
            triggerComplete();
          } else if (type === "quickQuestions") {
            const quickQuestionsData = DATA.parts.quickQuestions;
            const totalSubQuestions =
              quickQuestionsData[id as unknown as number]?.questions.length ?? 0;
            if (index + 1 < totalSubQuestions) {
              setIndex((prev) => prev + 1);
              if (rightsTurn) addRightScore(1);
              else addLeftScore(1);
            } else {
              pauseAudio();
            }
            audioCorrect.play();
            if (!zdone && index + 1 === totalSubQuestions) {
              if (rightsTurn) addRightScore(1);
              else addLeftScore(1);
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
            if (rightsTurn) addRightScore(-1);
            else addLeftScore(-1);
          } else if (type === "poeticChase") {
            if (rightsTurn) {
              setRightWrong((prev) => prev + 1);
              addRightScore(-5);
            } else {
              setLeftWrong((prev) => prev + 1);
              addLeftScore(-5);
            }
            setRightsTurn(!rightsTurn);
            setDuration(15);
            triggerComplete();
            audioWrong.play();
          } else if (type === "quickQuestions") {
            const quickQuestionsData = DATA.parts.quickQuestions;
            const totalSubQuestions =
              quickQuestionsData[id as unknown as number]?.questions.length ?? 0;
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
            const totalSets = DATA.parts.quickQuestions.length;
            if ((id as number) < totalSets) {
              setId((prev) => (prev as number) + 1);
              setRightsTurn(!rightsTurn);
            }
            setIndex(0);
            setZdone(false);
            triggerComplete();
            setIsPlaying(false);
          } else {
            setDuration(type === "debate" ? 60 : (hduration ?? 0));
            triggerComplete();
            setIsPlaying(false);
          }
          break;
        case "e":
          if (["debate", "puzzles", "windows"].includes(type)) {
            navigate(`/rate/${type}`);
          }
          if (type === "poeticChase") {
            addRightScore(15);
            addLeftScore(15);
          }
          if (type === "askSmartly") {
            if (rightsTurn) addRightScore(20);
            else addLeftScore(20);
          }
          break;
        case "m":
          if (type === "puzzles") {
            updateData((prevState) => {
              const newData = { ...prevState };
              const puzzles = newData.parts[type] as Array<{ done?: boolean }>;
              const puzzle = puzzles[id as unknown as number];
              if (puzzle) puzzle.done = !question.done;
              return newData;
            });
          } else if (type === "windows") {
            updateData((prevState) => {
              const newData = { ...prevState };
              const windows = newData.parts[type] as Record<
                string,
                Array<{ done?: boolean }>
              >;
              const windowCategory = windows[id as string];
              if (windowCategory?.[index]) {
                windowCategory[index].done = !question.done;
              }
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
      hduration,
      navigate,
      pauseAudio,
      triggerComplete,
      audio,
      audioCorrect,
      audioWrong,
      setTurned,
      setRightsTurn,
      addRightScore,
      addLeftScore,
      updateData,
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
          const importedFile = await import(
            /* @vite-ignore */ `../assets/${fileLoc}`
          );
          setFile(importedFile.default as string);
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
            overlay={showOverlay && !!file}
            right
            turn={rightsTurn && turned}
          />
          <Score
            zero={
              type === "poeticChase" ||
              type === "askSmartly" ||
              type === "quickQuestions"
            }
            overlay={showOverlay && !!file}
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
            ? DATA.parts.quickQuestions[id as unknown as number]?.title
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
            trailColor="#ffffff"
            strokeWidth={20}
            trailStrokeWidth={25}
            size={600}
            onUpdate={(remaining: number) => {
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
            {({ remainingTime }: { remainingTime: number }) => (
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
          <img className="Question-overlay-image" src={file ?? ""} alt="question" />
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
