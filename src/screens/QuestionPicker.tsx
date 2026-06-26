import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import IconButton from "../components/IconButton";
import Score from "../components/Score";
import { useShowStore } from "../state";

const WINDOW_NAMES: Record<string, string> = {
  naturalSciences: "العلوم الطبيعية",
  humanSciences: "العلوم الانسانية",
  misc: "حقل الالغام",
  arts: "الادب والفنون",
  religion: "الدين والسيرة",
};

export default function QuestionPicker() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const navigate = useNavigate();
  const [active, setActive] = useState<number>(0);
  const DATA = useShowStore((s) => s.data);
  const rightsTurn = useShowStore((s) => s.rightsTurn);
  const turned = useShowStore((s) => s.turned);
  const isntWindows = id === "puzzles" || id === "quickQuestions";

  if (!DATA) return null;

  const section = isntWindows
    ? (DATA.parts[id as keyof typeof DATA.parts] as Array<{ done?: boolean }>)
    : DATA.parts.windows[id as keyof typeof DATA.parts.windows];
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(e.key);
      const nkey = parseInt(e.key);

      if (!section) return;
      const length = section.length;
      if (nkey >= 0 && nkey <= length) {
        if (nkey === active && nkey !== 0) {
          if (isntWindows) navigate("/question/" + id + "/" + (nkey - 1));
          else navigate("/question/windows/" + id + "/" + (nkey - 1));
        } else setActive(nkey);
      }
    },
    [id, active, navigate, section, isntWindows],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="w-screen h-screen m-0 p-0 flex flex-col items-center justify-center [animation:starta_0.5s_ease-in-out_forwards_1] scale-0 translate-y-[500px] blur-[1.5rem]">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="text-white text-[12rem] font-bold m-0 mt-[4rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">{WINDOW_NAMES[id]}</h1>
      <div className="w-full m-0 p-0 flex justify-center items-center flex-row-reverse">
        {section?.map((question: { done?: boolean }, i: number) => (
          <IconButton
            key={i}
            done={question.done}
            active={active === i + 1}
            title={String(i + 1)}
          />
        ))}
      </div>
    </div>
  );
}
