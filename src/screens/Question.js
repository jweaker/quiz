import "./Question.css";
import { useNavigate, useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/ding.wav";

import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useState } from "react";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
import { GiInfinity } from "react-icons/gi";
export default function Question() {
  const params = useParams();
  const {
    rightsTurn,
    setLeftScore,
    setRightScore,
    setRightsTurn,
    DATA,
    setDATA,
  } = useGlobalContext();
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [id, setId] = useState(parseInt(params.id));
  const [index, setIndex] = useState(parseInt(params.index));
  const [zdone, setZdone] = useState(false);
  const type = parseInt(params.type);
  console.log(type, id, index);
  const window = DATA.parts[type - 1][id - 1];
  const question =
    type === 2 ? window.questions[index] : type === 4 ? window[index] : window;
  const text = question.text;
  const hduration = question.duration;
  const [leftWrong, setLeftWrong] = useState(0);
  const [rightWrong, setRiteWrong] = useState(0);
  const [duration, setDuration] = useState(hduration);
  const marks = question.marks;
  const [audio] = useState(new Audio(sourceAudio));
  const [audio2] = useState(new Audio(sourceAudio2));
  const answer = question.answer;
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Escape":
          audio?.pause?.();
          break;
        case "Enter":
          console.log(isPlaying);
          if (isPlaying) audio.pause();
          else {
            console.log("play");
            audio.play();
          }
          setIsPlaying((e) => !e);
          break;
        case "z":
        case "Z":
          if (type === 5) {
            setDuration(30);
            setRightsTurn(e => !e);
            setIsComplete(true);
            audio.volume = 0;
            audio.playbackRate = 0.5;
            audio.currentTime = 0;
            setTimeout(() => {
              setIsComplete(false);
            }, 0);
          }
          else if (type === 4) {
            console.log(index + 1, DATA.parts[3][id - 1].length, zdone);
            if (index + 1 < DATA.parts[3][id - 1].length) {
              console.log("id");

              setIndex((e) => e + 1);
              if (rightsTurn) setRightScore((e) => e + 2);
              else setLeftScore((e) => e + 2);
            } else {
              audio.pause();
              setIsPlaying(false);
            }
            if (!zdone && index + 1 === DATA.parts[3][id - 1].length) {
              console.log("zdone");
              if (rightsTurn) setRightScore((e) => e + 2);
              else setLeftScore((e) => e + 2);
              setZdone(true);
            }
          } else {
            audio.pause();
            setIsPlaying(false);
            setIsComplete((e) => !e);
            if (type === 1) setRightsTurn(false);

            // else if (rightsTurn) {
            //   setRightScore((e) => e + marks);
            //   setRightsTurn((e) => !e);
            // } else {
            //   setLeftScore((e) => e + marks);
            //   setRightsTurn((e) => !e);
            // }
          }
          break;
        case "x":
        case "X":
          if (type === 5) {
            if (rightsTurn) setRiteWrong((e) => e + 1)
            else setLeftWrong(e => e + 1)
            setRightsTurn(e => !e);
            setDuration(30);
            setIsComplete(true);
            audio.volume = 0;
            audio.playbackRate = 0.5;
            audio.currentTime = 0;
            setTimeout(() => {
              setIsComplete(false);
            }, 0);
          }
          else
            if (type === 4) {
              if (index + 1 < DATA.parts[3][id - 1].length)
                setIndex((e) => e + 1);
              else {
                audio.pause();
                setIsPlaying(false);
              }
            } else {
              audio.pause();
              setIsPlaying(false);
              setIsComplete((e) => !e);
              if (type === 1) setRightsTurn(true);
            }
          break;

        case "1":
          if (type !== 3) break;
          setDuration(45);
          setIsComplete(true);
          setIsPlaying(false);
          audio.volume = 0;
          audio.playbackRate = 0.5;
          audio.currentTime = 0;
          setTimeout(() => {
            setIsComplete(false);
          }, 0);
          break;
        case "2":
          if (type !== 3) break;
          setDuration(90);
          setIsComplete(true);
          setIsPlaying(false);
          audio.volume = 0;
          audio.playbackRate = 0.5;
          audio.currentTime = 0;
          setTimeout(() => {
            setIsComplete(false);
          }, 0);
          break;
        case "3":
          if (type !== 6) break;
          setRightsTurn((e) => !e);
          setDuration(90);
          setIsComplete(true);
          setIsPlaying(false);
          audio.volume = 0;
          audio.playbackRate = 0.5;
          audio.currentTime = 0;
          setTimeout(() => {
            setIsComplete(false);
          }, 0);
          break;
        case "4":
          if (type !== 4) break;
          if (id < DATA.parts[3].length) {
            setId((e) => e + 1);
            setRightsTurn((e) => !e);
          }
          setIndex(0);
          setIsComplete(true);
          setZdone(false);
          setIsPlaying(false);
          audio.volume = 0;
          audio.playbackRate = 0.5;
          audio.currentTime = 0;
          setTimeout(() => {
            setIsComplete(false);
          }, 0);
          break;
        case "End":
          if (type === 3 || type === 2 || type === 6) navigate("/rate/" + type);
          if (type === 5) {
            const rscore = 15 - (Math.min(3, rightWrong) * 5);
            setRightScore(e => e + rscore);
            const lscore = 15 - (Math.min(3, leftWrong) * 5);
            setLeftScore(e => e + lscore);
          }
          break;
        case "PageDown":
          if (type !== 2) break;
          setDATA((prevState) => {
            const DATA = { ...prevState };
            console.log(DATA);
            DATA.parts[1][id - 1].questions[index].done = !question.done;
            return DATA;
          });
          break;
        default:
          break;
      }
    },
    [
      setDATA,
      leftWrong,
      rightWrong,
      DATA,
      question,
      navigate,
      audio,
      id,

      index,
      setRightsTurn,
      setRightScore,
      type,

      isPlaying,
      setLeftScore,
      rightsTurn,
      zdone,
    ]
  );
  useEffect(() => {
    audio.loop = true;
    audio.volume = 0;
    audio.playbackRate = 0.5;
    audio2.volume = 0.1;
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // esslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown, audio, audio2]);
  return (
    <div className="Question">
      <Score right turn={rightsTurn && type !== 1 && type !== 3} />
      <Score turn={!rightsTurn} />
      <h1
        className={
          "Question-title" +
          (type === 6 || type === 5 || type === 3 || ((type === 4 || type === 1) && !isPlaying) ? " Question-title-6" : "")
        }
      >
        {!isPlaying ? type === 4 ? "اكمل" : type === 1 ? "سؤال السرعة" : text : text}
      </h1>
      <div
        className={
          "Question-timer-container" +
          (isComplete && type !== 3 && type !== 6
            ? " Question-timer-container-complete"
            : "")
        }
      >
        {isComplete ? (
          type !== 3 &&
          type !== 4 &&
          type !== 6 && <h1 className="Question-answer">{answer}</h1>
        ) : type === 1 || type === 7 ? (
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
            onUpdate={(e) => {
              if (e === 14) audio.currentTime = 0;
              console.log(audio.currentTime);
              audio.playbackRate =
                e <= 15 ? 2.5 - ((e + duration - 15) / duration) * 2 : 0.5;
              audio.volume = e <= 15 ? 1 - (e + duration - 15) / duration : 0;
              console.log(audio.playbackRate, audio.volume);
            }}
            onComplete={() => {
              audio.pause();
              audio2.play();
            }}
          >
            {({ remainingTime }) => (
              <span className="Question-timer">{remainingTime}</span>
            )}
          </CountdownCircleTimer>
        )}
      </div>
    </div>
  );
}
