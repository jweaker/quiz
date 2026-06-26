import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/boom.mp3";
import sourceAudioCorrect from "../assets/correct.mp3";
import sourceAudioWrong from "../assets/wrong.mp3";
import sourceAudioWhoosh from "../assets/whoosh.mp3";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useRef, useState } from "react";
import Score from "../components/Score";
import { useShowStore } from "../state";
import { GiInfinity } from "react-icons/gi";

type TeamSide = "right" | "left";
type QuizQuestion = {
  text?: string;
  duration?: number;
  file?: string;
  isImage?: boolean;
  answer?: string;
  done?: boolean;
};

type QuickQuestionSet = {
  title?: string;
  questions?: QuizQuestion[];
};

const DEBATE_DURATIONS = [60, 60, 40, 40] as const;
const RAPID_DURATION = 60;
const POETIC_CLOCK_MS = 100_000;

function isLetterKey(key: string): boolean {
  return /^[A-Za-z\u0621-\u064A]$/.test(key);
}

function formatLetter(key: string): string {
  return /^[A-Za-z]$/.test(key) ? key.toUpperCase() : key;
}

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
  const type = params.type ?? "";
  const navigate = useNavigate();

  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [id, setId] = useState<string | number>(params.id ?? "0");
  const [index, setIndex] = useState<number>(parseInt(params.index ?? "0", 10) || 0);
  const [zdone, setZdone] = useState(false);
  const [file, setFile] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const [debateRound, setDebateRound] = useState(0);
  const [quickPhase, setQuickPhase] = useState<"A" | "B">("A");

  const [requiredLetter, setRequiredLetter] = useState<string | null>(null);

  const [leftMs, setLeftMs] = useState(POETIC_CLOCK_MS);
  const [rightMs, setRightMs] = useState(POETIC_CLOCK_MS);
  const [chessActive, setChessActive] = useState<TeamSide | null>(null);

  const leftMsRef = useRef(POETIC_CLOCK_MS);
  const rightMsRef = useRef(POETIC_CLOCK_MS);
  const chessActiveRef = useRef<TeamSide | null>(null);
  const chessIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const nextId = params.id ?? "0";
    const parsedId = Number(nextId);
    setId(Number.isNaN(parsedId) ? nextId : parsedId);
    setIndex(parseInt(params.index ?? "0", 10) || 0);
    setZdone(false);
    setQuickPhase("A");
    setDebateRound(0);
    setRequiredLetter(null);
    setShowOverlay(false);
  }, [params.id, params.index, type]);

  if (!data) return null;
  const DATA = data;

  const settings = DATA.settings;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const partsAny = DATA.parts as Record<string, any>;
  const currentPart = partsAny[type];

  const fallbackQuestion: QuizQuestion =
    type === "poeticChase"
      ? {
          text: "المطاردة الشعرية",
          duration: settings?.poeticChaseDuration ?? 100,
        }
      : type === "askSmartly"
        ? {
            text: "اسأل بذكاء",
            duration: settings?.askIntelligentlyDuration ?? 120,
            file: "animals.png",
            isImage: true,
          }
        : type === "debate"
          ? {
              text: "المناظرة",
              duration: settings?.debateDuration ?? 60,
            }
          : {};

  const question: QuizQuestion = currentPart
    ? Array.isArray(currentPart)
      ? (currentPart[id as number] as QuizQuestion)
      : type === "quickQuestions"
        ? ((currentPart as QuickQuestionSet[])[id as number]?.questions?.[index] as
            | QuizQuestion
            | undefined) ?? fallbackQuestion
        : type === "windows"
          ? ((currentPart as Record<string, QuizQuestion[]>)[id as string]?.[
              index
            ] as QuizQuestion | undefined) ?? fallbackQuestion
          : ((currentPart as QuizQuestion) ?? fallbackQuestion)
    : fallbackQuestion;

  const quickSet = DATA.parts.quickQuestions[id as number] as QuickQuestionSet | undefined;
  const quickTitle = quickSet?.title ?? DATA.parts.quickQuestions[0]?.title;
  const totalSubQuestions = quickSet?.questions?.length ?? 0;

  const text = question.text ?? "";
  const fileLoc = question.file;
  const isImage = question.isImage;
  const answer = question.answer;
  const baseDuration =
    type === "quickQuestions"
      ? RAPID_DURATION
      : type === "askSmartly"
        ? settings?.askIntelligentlyDuration ?? 120
        : type === "puzzles"
          ? question.duration ?? settings?.puzzleDuration ?? 90
          : question.duration ?? 0;

  useEffect(() => {
    if (type === "debate") {
      setDuration(DEBATE_DURATIONS[0]);
      return;
    }
    setDuration(baseDuration);
  }, [type, baseDuration]);

  const [audio] = useState<HTMLAudioElement>(new Audio(sourceAudio));
  const [audio2] = useState<HTMLAudioElement>(new Audio(sourceAudio2));
  const [audioCorrect] = useState<HTMLAudioElement>(new Audio(sourceAudioCorrect));
  const [audioWrong] = useState<HTMLAudioElement>(new Audio(sourceAudioWrong));
  const [audioWhoosh] = useState<HTMLAudioElement>(new Audio(sourceAudioWhoosh));

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

  const clearChessTimer = useCallback(() => {
    if (chessIntervalRef.current !== null) {
      window.clearInterval(chessIntervalRef.current);
      chessIntervalRef.current = null;
    }
  }, []);

  const startChessInterval = useCallback(
    (team: TeamSide) => {
      clearChessTimer();
      chessActiveRef.current = team;
      setChessActive(team);

      chessIntervalRef.current = window.setInterval(() => {
        const active = chessActiveRef.current;
        if (!active) return;

        if (active === "right") {
          rightMsRef.current = Math.max(0, rightMsRef.current - 100);
          setRightMs(rightMsRef.current);

          if (rightMsRef.current <= 0) {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
            setIsPlaying(false);
            const bonus = Math.floor(leftMsRef.current / 5000);
            if (bonus > 0) addLeftScore(bonus);
            setTurned(true);
          }
        } else {
          leftMsRef.current = Math.max(0, leftMsRef.current - 100);
          setLeftMs(leftMsRef.current);

          if (leftMsRef.current <= 0) {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
            setIsPlaying(false);
            const bonus = Math.floor(rightMsRef.current / 5000);
            if (bonus > 0) addRightScore(bonus);
            setTurned(true);
          }
        }
      }, 100);
    },
    [addLeftScore, addRightScore, clearChessTimer, setTurned],
  );

  const switchChessClock = useCallback(() => {
    const current = chessActiveRef.current;
    if (!current) return;
    const next = current === "right" ? "left" : "right";
    startChessInterval(next);
  }, [startChessInterval]);

  useEffect(() => {
    return () => {
      clearChessTimer();
    };
  }, [clearChessTimer]);

  useEffect(() => {
    leftMsRef.current = POETIC_CLOCK_MS;
    rightMsRef.current = POETIC_CLOCK_MS;
    setLeftMs(POETIC_CLOCK_MS);
    setRightMs(POETIC_CLOCK_MS);
    setChessActive(null);
    chessActiveRef.current = null;
    clearChessTimer();
  }, [type, clearChessTimer]);

  useEffect(() => {
    try {
      if (type === "puzzles") {
        updateData((prevState) => {
          const newData = { ...prevState };
          const puzzles = newData.parts.puzzles as Array<{ done?: boolean }>;
          const puzzle = puzzles[id as number];
          if (puzzle) puzzle.done = !question.done;
          return newData;
        });
      } else if (type === "windows") {
        updateData((prevState) => {
          const newData = { ...prevState };
          const windows = newData.parts.windows as Record<string, Array<{ done?: boolean }>>;
          const windowCategory = windows[id as string];
          if (windowCategory?.[index]) {
            windowCategory[index].done = !question.done;
          }
          return newData;
        });
      }
      audioWhoosh.play();
    } catch {
      // no-op
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape": {
          if (type === "poeticChase") {
            clearChessTimer();
            chessActiveRef.current = null;
            setChessActive(null);
            setRequiredLetter(null);
          }
          pauseAudio();
          break;
        }

        case "Enter": {
          if (type === "poeticChase") {
            if (!isPlaying) {
              const startTeam: TeamSide = rightsTurn ? "right" : "left";
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
            if (type !== "speedQuestions" && type !== "audienceQuestions") {
              audio.play();
            }
            setIsPlaying(true);
          }
          break;
        }

        case "z":
        case "Z": {
          if (type === "windows") {
            audioCorrect.play();
          }

          setTurned(true);

          if (type === "askSmartly") {
            setRightsTurn(!rightsTurn);
            triggerComplete();
            setDuration(settings?.askIntelligentlyDuration ?? 120);
            setIsComplete(true);
            setIsPlaying(false);
          } else if (type === "poeticChase") {
            const scoringTeam = chessActiveRef.current ?? (rightsTurn ? "right" : "left");
            if (scoringTeam === "right") addRightScore(1);
            else addLeftScore(1);

            audioCorrect.play();
            switchChessClock();
          } else if (type === "quickQuestions") {
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
        }

        case "x":
        case "X": {
          setTurned(true);

          if (type === "windows") {
            audioWrong.play();
          }

          if (type === "askSmartly") {
            if (rightsTurn) addRightScore(-1);
            else addLeftScore(-1);
          } else if (type === "poeticChase") {
            audioWrong.play();
            switchChessClock();
          } else if (type === "quickQuestions") {
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
        }

        case "c":
        case "C": {
          if (type === "poeticChase") {
            switchChessClock();
          }
          break;
        }

        case "1": {
          if (type === "quickQuestions") {
            if (quickPhase === "A") {
              setQuickPhase("B");
              setIndex(0);
              setZdone(false);
              setRightsTurn(!rightsTurn);
              triggerComplete();
              setIsPlaying(false);
              setDuration(RAPID_DURATION);
            } else {
              pauseAudio();
              navigate(-1);
            }
          } else if (type === "debate") {
            const nextRound = Math.min(debateRound + 1, DEBATE_DURATIONS.length - 1);
            setDebateRound(nextRound);
            const debateDuration = DEBATE_DURATIONS[nextRound] ?? 40;
            setDuration(debateDuration);
            triggerComplete();
            setIsPlaying(false);
          } else {
            setDuration(baseDuration);
            triggerComplete();
            setIsPlaying(false);
          }
          break;
        }

        case "e": {
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
            if (rightBonus > 0) addRightScore(rightBonus);
            if (leftBonus > 0) addLeftScore(leftBonus);
          }

          if (type === "askSmartly") {
            if (rightsTurn) addRightScore(20);
            else addLeftScore(20);
          }
          break;
        }

        case "m": {
          if (type === "puzzles") {
            updateData((prevState) => {
              const newData = { ...prevState };
              const puzzles = newData.parts.puzzles as Array<{ done?: boolean }>;
              const puzzle = puzzles[id as number];
              if (puzzle) puzzle.done = !question.done;
              return newData;
            });
          } else if (type === "windows") {
            updateData((prevState) => {
              const newData = { ...prevState };
              const windows = newData.parts.windows as Record<string, Array<{ done?: boolean }>>;
              const windowCategory = windows[id as string];
              if (windowCategory?.[index]) {
                windowCategory[index].done = !question.done;
              }
              return newData;
            });
          }
          break;
        }

        case "f": {
          setShowOverlay((prev) => !prev);
          break;
        }

        default: {
          if (
            type === "poeticChase" &&
            !e.metaKey &&
            !e.ctrlKey &&
            !e.altKey &&
            isLetterKey(e.key)
          ) {
            setRequiredLetter(formatLetter(e.key));
          }
        }
      }
    },
    [
      type,
      isPlaying,
      rightsTurn,
      index,
      totalSubQuestions,
      zdone,
      question.done,
      id,
      quickPhase,
      debateRound,
      settings?.askIntelligentlyDuration,
      navigate,
      pauseAudio,
      triggerComplete,
      switchChessClock,
      startChessInterval,
      baseDuration,
      clearChessTimer,
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
    audio.loop = true;
    audio.volume = 0.7;
    audio2.volume = 1;
    audioCorrect.volume = 1;
    audioWrong.volume = 1;

    if (fileLoc) {
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
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [audio, audio2, audioCorrect, audioWrong, fileLoc, handleKeyDown]);

  const formatChessTime = (ms: number) => Math.ceil(ms / 1000);

  return (
    <div className="w-screen h-screen m-0 p-0 flex flex-col items-center justify-center scale-0 translate-y-[500px] blur-[1.5rem] [animation:starta_1s_ease-in-out_forwards_1]">
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
          "text-white max-w-[95%] font-bold text-center p-[1rem] transition-transform duration-200 ease-in-out mb-[4rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)] rounded-[3rem] whitespace-pre-line align-bottom" +
          (["poeticChase", "debate", "askSmartly"].includes(type) ||
          (["quickQuestions", "speedQuestions"].includes(type) && !isPlaying)
            ? " text-[14rem] -mt-[6rem] border-none"
            : " text-[6rem] border-[15px] border-solid border-white") +
          (showOverlay && file
            ? " absolute z-[99] scale-50 -translate-y-[82vh] opacity-65"
            : "")
        }
      >
        {!isPlaying
          ? type === "quickQuestions"
            ? `${quickTitle ?? "الرشق السريع"}${quickPhase === "B" ? " - الجولة الثانية" : ""}`
            : type === "speedQuestions"
              ? "سؤال السرعة"
              : text
          : text}
      </h1>

      {type === "poeticChase" && requiredLetter && (
        <div className="mb-4 rounded-2xl border border-white/30 bg-black/35 px-10 py-3 text-white text-[4rem] font-bold [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">
          الحرف المطلوب: <span className="western-numerals">{requiredLetter}</span>
        </div>
      )}

      <div
        className={
          "bg-[radial-gradient(circle,rgba(48,205,227,1)_0%,rgba(4,52,182,1)_80%)] rounded-[300px] transition-all duration-[0.4s] ease-in-out justify-center items-center flex w-[600px] min-h-[600px] shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)]" +
          (isComplete && type !== "debate"
            ? " !rounded-[3rem] !bg-green-600 !w-[60%] !min-h-[10rem]"
            : "") +
          (showOverlay && file
            ? " absolute scale-50 translate-x-[85vw] -translate-y-[75vh] z-[99] opacity-65"
            : "") +
          (type === "poeticChase"
            ? " !w-auto !min-h-0 px-[8rem] py-[5rem] !rounded-[4rem] !bg-[radial-gradient(ellipse_at_center,rgba(10,20,60,0.85)_0%,rgba(4,12,50,0.95)_100%)] border border-white/10"
            : "")
        }
      >
        {isComplete ? (
          type !== "debate" &&
          type !== "poeticChase" &&
          type !== "askSmartly" && (
            <h1 className="mt-0 [animation:answer_0.4s_0.3s_ease-in-out_forwards_1] text-[5rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)] text-white opacity-0 mb-0 overflow-hidden blur-[1.5rem] text-center whitespace-pre-line align-bottom">
              {answer}
            </h1>
          )
        ) : type === "speedQuestions" || type === "audienceQuestions" ? (
          <GiInfinity
            size={500}
            color="white"
            className="p-[50px] rounded-[300px] bg-[radial-gradient(circle,rgba(0,0,0,0.5)_0%,rgba(4,52,182,0)_80%)]"
          />
        ) : type === "poeticChase" ? (
          <div className="flex flex-row items-center gap-[7rem]">
            <div
              className={
                "flex h-[340px] w-[340px] items-center justify-center rounded-full border-[6px] border-white/15 bg-white/5 opacity-30 transition-all duration-300" +
                (chessActive === "right"
                  ? " opacity-100 scale-100 border-emerald-400 shadow-[0_0_50px_rgba(0,255,136,0.55),0_0_100px_rgba(0,255,136,0.2),inset_0_0_40px_rgba(0,255,136,0.08)]"
                  : " scale-90")
              }
            >
              <span className="western-numerals text-[10rem] text-white font-bold leading-none [text-shadow:0px_5px_20px_rgba(0,0,0,0.7)]">
                {formatChessTime(rightMs)}
              </span>
            </div>

            <div
              className={
                "flex h-[340px] w-[340px] items-center justify-center rounded-full border-[6px] border-white/15 bg-white/5 opacity-30 transition-all duration-300" +
                (chessActive === "left"
                  ? " opacity-100 scale-100 border-emerald-400 shadow-[0_0_50px_rgba(0,255,136,0.55),0_0_100px_rgba(0,255,136,0.2),inset_0_0_40px_rgba(0,255,136,0.08)]"
                  : " scale-90")
              }
            >
              <span className="western-numerals text-[10rem] text-white font-bold leading-none [text-shadow:0px_5px_20px_rgba(0,0,0,0.7)]">
                {formatChessTime(leftMs)}
              </span>
            </div>
          </div>
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
              <span className="western-numerals text-white text-[16rem] font-bold [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">
                {remainingTime}
              </span>
            )}
          </CountdownCircleTimer>
        )}
      </div>

      <div
        className={
          "fixed left-0 top-0 w-full opacity-0 transition-all duration-200 ease-in-out h-full bg-black" +
          (showOverlay && file ? " !opacity-100" : "")
        }
      >
        {isImage ? (
          <img
            className="w-full select-none [-webkit-user-drag:none] h-full object-contain"
            src={file ?? ""}
            alt="question"
          />
        ) : (
          file &&
          showOverlay && (
            <video
              src={file}
              className="w-full select-none [-webkit-user-drag:none] h-full object-contain"
              autoPlay
              loop
            />
          )
        )}
      </div>
    </div>
  );
}
