import "./QuestionPicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import IconButton from "../components/IconButton";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";

const WINDOW_NAMES: Record<string, string> = {
  naturalSciences: "العلوم الطبيعية",
  humanSciences: "العلوم الانسانية",
  misc: "اسئلة عامة",
  arts: "الادب والفنون",
  religion: "الدين والسيرة",
};

export default function QuestionPicker() {
  const params = useParams<{ id: string }>();
  const id = params.id!;
  const navigate = useNavigate();
  const [active, setActive] = useState<number>(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const isntWindows = id === "puzzles" || id === "quickQuestions";
  const section = isntWindows
    ? (DATA.parts[id] as Array<{ done?: boolean }>)
    : DATA.parts.windows[id];
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
    <div className="QuestionPicker">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="QuestionPicker-title">{WINDOW_NAMES[id]}</h1>
      <div className="QuestionPicker-container">
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
