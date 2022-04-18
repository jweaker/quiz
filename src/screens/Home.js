import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../components/IconButton";
import { MdWindow, MdSports } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { RiTimerFill } from "react-icons/ri";
import "./Home.css";
import { useGlobalContext } from "../contexts/Global";
export default function Home() {
  const {
    quickQuestion,
    setQuickQuestion,
    discussionCounter,
    setDiscussionCounter,
  } = useGlobalContext();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 6) {
        if (nkey === active && nkey !== 0) {
          if (nkey === 1) {
            navigate(`/question/1/${quickQuestion + 1}/0`);
            setQuickQuestion(1);
          } else if (nkey === 2) navigate(`/windows`);
          else if (nkey === 3) {
            navigate(`/question/3/${discussionCounter + 1}/0`);
            setDiscussionCounter(1);
          } else if (nkey === 4) {
            navigate(`/question/4/1/0`);
            setDiscussionCounter(1);
          }
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [
      active,
      navigate,
      setQuickQuestion,
      quickQuestion,
      discussionCounter,
      setDiscussionCounter,
    ]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <div className="Home">
      <div className="Home-container">
        <IconButton
          title="سؤال السرعة"
          Icon={MdSports}
          width="50rem"
          color="tomato"
          height="20rem"
          fontSize={"4rem"}
          active={active === 1}
        />
        <IconButton
          title="النوافذ"
          Icon={MdWindow}
          width="50rem"
          height="20rem"
          fontSize={"4rem"}
          active={active === 2}
        />
        <IconButton
          title="المناظرة"
          Icon={IoMdChatbubbles}
          width="50rem"
          height="20rem"
          fontSize={"4rem"}
          active={active === 3}
        />
        <IconButton
          title="الرشق السريع"
          Icon={RiTimerFill}
          width="50rem"
          height="20rem"
          fontSize={"4rem"}
          active={active === 4}
        />
        <IconButton
          title="النوافذ"
          Icon={MdWindow}
          width="50rem"
          height="20rem"
          fontSize={"4rem"}
          active={active === 5}
        />
        <IconButton
          title="النوافذ"
          Icon={MdWindow}
          width="50rem"
          height="20rem"
          fontSize={"4rem"}
          active={active === 6}
        />
      </div>
    </div>
  );
}
