import { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../components/IconButton";
import { MdWindow, MdSports } from "react-icons/md";
import { IoMdChatbubbles } from "react-icons/io";
import { RiTimerFill } from "react-icons/ri";
import { GiJuggler } from "react-icons/gi";
import "./Home.css";
import { useGlobalContext } from "../contexts/Global";
import Score from "../components/Score";
import logob from "../assets/logob.png";
import logom from "../assets/logom.png";

export default function Home() {
  const {
    quickQuestion,
    setQuickQuestion,
    audienceQuesion,
    rightsTurn,
    turned,
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
            navigate(`/question/5/1/0`);
          } else if (nkey === 6) {
            navigate(`/question/6/1/0`);
          } else if (nkey === 7) {
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
    [
      audienceQuesion,
      setAudienceQuestion,
      active,
      navigate,
      setQuickQuestion,
      quickQuestion,
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
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <img src={logob} alt="" srcset="" className="logob" />
      <img src={logom} alt="" srcset="" className="logom" />

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
          title="المطاردة الشعرية"
          Icon={() => (
            <span
              style={{
                color: "dodgerblue",
                fontSize: "18rem",
                marginTop: "-11rem",
                marginBottom: "-7rem",
              }}
            >
              ت
            </span>
          )}
          width="25rem"
          height="25rem"
          fontSize={"3rem"}
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
