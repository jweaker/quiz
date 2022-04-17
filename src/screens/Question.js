import "./Question.css";
import WINDOWS from "../config/windows.json";
import { useParams } from "react-router-dom";
import sourceAudio from "../assets/tick.wav";
import sourceAudio2 from "../assets/ding.wav";

import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useCallback, useEffect, useState, useMemo, useRef } from "react";
export default function Question() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const params = useParams();
  const id = parseInt(params.id);
  const index = parseInt(params.index);
  const window = WINDOWS[id - 1];
  const question = window.questions[index];
  const text = question.text;
  const duration = question.duration;
  const audio = useRef();
  const audio2 = useRef();
  const initAudio = useMemo(() => {
    audio.current = new Audio(sourceAudio);
    audio.current.loop = true;
    return () => {};
  }, [audio]);
  const initAudio2 = useMemo(() => {
    audio2.current = new Audio(sourceAudio2);
    return () => {};
  }, [audio2]);
  const answer = question.answer;
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Enter":
          console.log(isPlaying);
          if (isPlaying) audio.current.pause();
          else audio.current.play();
          setIsPlaying((e) => !e);
          break;
        case "End":
          setIsComplete((e) => !e);
          break;
        default:
          break;
      }
    },
    [isPlaying, audio]
  );
  useEffect(() => {
    initAudio();
    initAudio2();
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      audio.current?.pause();
      audio2.current?.pause();
      audio.current = undefined;
      audio2.current = undefined;
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
  return (
    <div className="Question">
      <h1 className="Question-title">{text}</h1>
      <div
        className={
          "Question-timer-container" +
          (isComplete ? " Question-timer-container-complete" : "")
        }
      >
        {isComplete ? (
          <h1 className="Question-title Question-answer">{answer}</h1>
        ) : (
          <CountdownCircleTimer
            isPlaying={isPlaying}
            duration={duration}
            colors={["#00ff00", "#ffff01", "#A30000", "#A30000"]}
            colorsTime={[duration, duration / 2, 5, 0]}
            trailColor="white"
            strokeWidth={20}
            trailStrokeWidth={25}
            size={400}
            onUpdate={(e) => {
              audio.current.playbackRate = 2 - e / duration;
              audio.current.volume = (duration - e) / duration;
              console.log(audio.current.playbackRate);
            }}
            onComplete={() => {
              audio.current.pause();
              audio2.current.play();
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
