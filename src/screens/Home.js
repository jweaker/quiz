import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../components/IconButton";
import { MdWindow, MdSports, MdQuestionAnswer } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { RiQuestionMark, RiTimerFill } from "react-icons/ri";
import { GiJuggler, GiPuzzle } from "react-icons/gi";
import "./Home.css";
import { useGlobalContext } from "../contexts/Global";
import Score from "../components/Score";


export default function Home() {
  const {
    quickQuestion,
    setQuickQuestion,
    audienceQuesion,
    rightsTurn,
    turned,
    DATA,
    setAudienceQuestion,
    setDiscussionCounter,
  } = useGlobalContext();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 7) {
        if (nkey === active && nkey !== 0) {
          if (nkey === 1) {
            navigate(`/question/1/${quickQuestion + 1}/0`);
            setQuickQuestion(1);
          } else if (nkey === 2) navigate(`/windows`);
          else if (nkey === 3) {
            navigate(`/question/3/1/0`);
            setDiscussionCounter(1);
          } else if (nkey === 4) {
            navigate(`/question/4/1/0`);
            setDiscussionCounter(1);
          } else if (nkey === 5) {
            navigate(`/questionpicker/7`);
          } else if (nkey === 6) {
            navigate(`/question/6/1/0`);
          } else if (nkey === 7 && audienceQuesion < DATA.parts[6].length) {
            navigate(`/question/7/${audienceQuesion + 1}/0`);
            setAudienceQuestion((e) => e + 1);
          }
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [active, navigate, audienceQuesion, DATA.parts, quickQuestion, setQuickQuestion, setDiscussionCounter, setAudienceQuestion]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className="Home">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <span className="Question-title Question-title-6 Home-title">مسابقة سامراء الأولى</span>
      <div className="Home-container">
        <IconButton
          title="سؤال السرعة"
          Icon={MdSports}
          width="25rem"
          height="25rem"
          color="tomato"
          fontSize={"4rem"}
          active={active === 1}
        />
        <IconButton
          title="النوافذ"
          Icon={MdWindow}
          width="25rem"
          height="25rem"
          fontSize={"4rem"}
          active={active === 2}
        />
        <IconButton
          title="المناظرة"
          Icon={IoMdChatbubbles}
          width="25rem"
          height="25rem"
          fontSize={"4rem"}
          active={active === 3}
        />
        <IconButton
          title="الرشق السريع"
          Icon={RiTimerFill}
          width="25rem"
          height="25rem"
          fontSize={"4rem"}
          active={active === 4}
        />
        <IconButton
          title="الحزورات"
          Icon={RiQuestionMark}
          width="25rem"
          height="25rem"
          fontSize={"4rem"}
          active={active === 5}
        />
        <IconButton
          title="المواهب"
          Icon={GiJuggler}
          width="25rem"
          height="25rem"
          fontSize={"4rem"}
          active={active === 6}
        />
      </div>
    </div>
  );
}
