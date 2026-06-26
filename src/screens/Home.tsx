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
import { useShowStore } from "../state";
import Score from "../components/Score";

const ICON_SIZE = "35rem";
const FONT_SIZE = "5rem";

export default function Home() {
  const quickQuestion = useShowStore((s) => s.quickQuestion);
  const setQuickQuestion = useShowStore((s) => s.setQuickQuestion);
  const audienceQuestion = useShowStore((s) => s.audienceQuestion);
  const setAudienceQuestion = useShowStore((s) => s.setAudienceQuestion);
  const rightsTurn = useShowStore((s) => s.rightsTurn);
  const turned = useShowStore((s) => s.turned);
  const DATA = useShowStore((s) => s.data);

  const navigate = useNavigate();
  const [active, setActive] = useState<number>(0);

  if (!DATA) return null;

  // Define actions for each key using useMemo for performance.
  const actions = useMemo(
    () =>
      ({
        1: () => {
          navigate(`/question/speedQuestions/${quickQuestion}`);
          if (DATA.parts.speedQuestions.length <= quickQuestion + 1)
            setQuickQuestion(0);
          else setQuickQuestion(quickQuestion + 1);
        },
        2: () => navigate(`/windows`),
        3: () => {
          if (DATA.parts.puzzles.length > 1)
            navigate(`/questionpicker/puzzles`);
          else navigate(`/question/puzzles/0`);
        },
        4: () => navigate(`/question/debate`),
        5: () => navigate(`/question/poeticChase`),
        6: () => navigate(`/question/askSmartly`),
        7: () => navigate(`/question/quickQuestions/0`),
        8: () => {
          if (audienceQuestion < DATA.parts.audienceQuestions?.length) {
            navigate(`/question/audienceQuestions/${audienceQuestion}`);
            setAudienceQuestion(audienceQuestion + 1);
            console.log(DATA.parts.audienceQuestions.length);
          } else {
            navigate(`/question/audienceQuestions/0`);
            setAudienceQuestion(0);
          }
        },
      }) as Record<number, () => void>,
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
    (e: KeyboardEvent) => {
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
    { key: 2, title: "نوافذ المعرفة", Icon: MdWindow },
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
    <div className="w-screen h-screen p-0 m-0 fixed flex justify-center items-center overflow-y-scroll flex-col [scrollbar-width:none] [-webkit-scrollbar:none]">
      <Score top right turn={rightsTurn && turned} />
      <Score top turn={!rightsTurn && turned} />
      <span className="text-[12rem] mt-[2rem] mb-0 opacity-0 [animation:startb_0.5s_ease-in-out_forwards_1] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)] text-white font-bold text-center p-[1rem] border-none">
        بشائر المعرفة
      </span>
      <div className="mt-[5rem] flex flex-wrap justify-center gap-[1rem] p-0 [&>*]:flex-[0_0_calc(20%-1rem)] [&>*]:max-w-[calc(20%-1rem)]">
        {iconButtons.map(({ key, title, Icon, color }) => (
          <IconButton
            key={key}
            title={title}
            Icon={Icon}
            width={ICON_SIZE}
            height={ICON_SIZE}
            color={color}
            fontSize={FONT_SIZE}
            active={active === key}
          />
        ))}
      </div>
    </div>
  );
}
