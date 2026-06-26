import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "@fontsource/aref-ruqaa/arabic-700.css";
import IconButton from "../components/IconButton";
import {
  MdWindow,
  MdSports,
  MdHelpOutline,
  MdOutlineDirectionsRun,
} from "react-icons/md";
import { TbUserQuestion } from "react-icons/tb";
import { RiTimerFill } from "react-icons/ri";
import { IoExtensionPuzzle } from "react-icons/io5";
import "./Home.css";
import { useGlobalContext } from "../contexts/Global";
import Score from "../components/Score";

const ICON_SIZE = "32rem";
const FONT_SIZE = "5rem";

export default function Home() {
  const {
    quickQuestion,
    setQuickQuestion,
    audienceQuestion,
    rightsTurn,
    turned,
    DATA,
    setAudienceQuestion,
  } = useGlobalContext();

  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  const actions = useMemo(
    () => ({
      1: () => {
        navigate(`/question/speedQuestions/${quickQuestion}`);
        if (DATA.parts.speedQuestions.length <= quickQuestion + 1)
          setQuickQuestion(0);
        else setQuickQuestion((p) => p + 1);
      },
      2: () => navigate(`/windows`),
      3: () => navigate(`/question/poeticChase`),
      4: () => navigate(`/question/puzzles/0`),
      5: () => navigate(`/question/debate`),
      6: () => navigate(`/question/askSmartly`),
      7: () => navigate(`/question/quickQuestions/0`),
      8: () => {
        if (audienceQuestion < DATA.parts.audienceQuestions?.length) {
          navigate(`/question/audienceQuestions/${audienceQuestion}`);
          setAudienceQuestion((prev) => prev + 1);
          console.log(DATA.parts.audienceQuestions.length);
        } else {
          navigate(`/question/audienceQuestions/0`);
          setAudienceQuestion(0);
        }
      },
    }),
    [
      navigate,
      quickQuestion,
      setQuickQuestion,
      audienceQuestion,
      DATA.parts,
      setAudienceQuestion,
    ],
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "0" || e.key === "f" || e.key === "F") {
        navigate("/finale");
        return;
      }
      const keyNum = Number(e.key);
      if (Number.isInteger(keyNum) && keyNum >= 1 && keyNum <= 8) {
        if (keyNum === active) {
          const action = actions[keyNum];
          if (action) action();
        } else {
          setActive(keyNum);
        }
      }
    },
    [active, actions, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  const iconButtons = [
    { key: 1, title: "سؤال السرعة", Icon: MdSports },
    { key: 2, title: "النوافذ", Icon: MdWindow },
    {
      key: 3,
      title: "المطاردة الشعرية",
      Icon: MdOutlineDirectionsRun,
    },
    { key: 4, title: "اللغز", Icon: IoExtensionPuzzle },
    { key: 5, title: "ماذا لو", Icon: MdHelpOutline },
    { key: 6, title: "اسأل بذكاء", Icon: TbUserQuestion },
    { key: 7, title: "الرشق السريع", Icon: RiTimerFill },
  ];

  return (
    <motion.div
      className="Home"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Score top right turn={rightsTurn && turned} />
      <Score top turn={!rightsTurn && turned} />
      <motion.span
        className="Question-title Question-title-6 Home-title"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
      >
        <span className="Home-title-text">بشائر المعرفة</span>
        <span className="Home-title-lantern" aria-hidden="true" />
      </motion.span>
      <div className="Home-container">
        {iconButtons.map(
          ({ key, title, Icon, color, fontSize: btnFontSize }, i) => (
            <IconButton
              key={key}
              title={title}
              Icon={Icon}
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              fontSize={btnFontSize || FONT_SIZE}
              active={active === key}
              index={i}
            />
          ),
        )}
      </div>
    </motion.div>
  );
}
