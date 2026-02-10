import { useCallback, useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import IconButton from "../components/IconButton";
import {
  MdWindow,
  MdSports,
  MdQuestionAnswer,
  MdOutlineDirectionsRun,
} from "react-icons/md";
import { TbUserQuestion } from "react-icons/tb";
import { RiTimerFill } from "react-icons/ri";
import { IoExtensionPuzzle } from "react-icons/io5";
import "./Home.css";
import { useGlobalContext } from "../contexts/Global";
import Score from "../components/Score";

const ICON_SIZE = "35rem";
const FONT_SIZE = "5rem";

export default function Home() {
  const {
    quickQuestion,
    setQuickQuestion,
    audienceQuestion, // corrected variable name
    rightsTurn,
    turned,
    DATA,
    setAudienceQuestion,
  } = useGlobalContext();

  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  // Define actions for each key using useMemo for performance.
  const actions = useMemo(
    () => ({
      1: () => {
        navigate(`/question/speedQuestions/${quickQuestion}`);
        if (DATA.parts.speedQuestions.length <= quickQuestion + 1)
          setQuickQuestion(0);
        else setQuickQuestion((p) => p + 1);
      },
      2: () => navigate(`/windows`),
      3: () => {
        if (DATA.parts.puzzles.length > 1) navigate(`/questionpicker/puzzles`);
        else navigate(`/question/puzzles/0`);
      },
      4: () => navigate(`/question/debate`),
      5: () => navigate(`/question/poeticChase`),
      6: () => navigate(`/question/askSmartly`),
      7: () => navigate(`/questionpicker/quickQuestions`),
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

  // Keydown handler: If the pressed key is the same as the active one (and not 0),
  // execute its associated action; otherwise, update the active state.
  const handleKeyDown = useCallback(
    (e) => {
      const keyNum = Number(e.key);
      if (Number.isInteger(keyNum) && keyNum >= 0 && keyNum <= 8) {
        if (keyNum === active && keyNum !== 0) {
          const action = actions[keyNum];
          if (action) action();
        } else {
          setActive(keyNum);
        }
      }
    },
    [active, actions],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  // Configuration for icon buttons to avoid repetitive code.
  const iconButtons = [
    { key: 1, title: "سؤال السرعة", Icon: MdSports, color: "tomato" },
    { key: 2, title: "النوافذ", Icon: MdWindow },
    { key: 3, title: "اللغز", Icon: IoExtensionPuzzle },
    { key: 4, title: "المناظرة", Icon: MdQuestionAnswer },
    {
      key: 5,
      title: "المطاردة الشعرية",
      Icon: MdOutlineDirectionsRun,
    },
    { key: 6, title: "اسأل بذكاء", Icon: TbUserQuestion },
    { key: 7, title: "الرشق السريع", Icon: RiTimerFill },
  ];

  return (
    <div className="Home">
      <Score top right turn={rightsTurn && turned} />
      <Score top turn={!rightsTurn && turned} />
      <span className="Question-title Question-title-6 Home-title">
        بشائر المعرفة
      </span>
      <div className="Home-container">
        {iconButtons.map(
          ({ key, title, Icon, color, fontSize: btnFontSize }) => (
            <IconButton
              key={key}
              title={title}
              Icon={Icon}
              width={ICON_SIZE}
              height={ICON_SIZE}
              color={color}
              fontSize={btnFontSize || FONT_SIZE}
              active={active === key}
            />
          ),
        )}
      </div>
    </div>
  );
}
