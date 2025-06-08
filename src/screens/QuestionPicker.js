import "./QuestionPicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import IconButton from "../components/IconButton";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
export default function QuestionPicker() {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const isntWindows = id === "puzzles" || id === "quickQuestions";
  const section = isntWindows ? DATA.parts[id] : DATA.parts.windows[id];
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);

      const length = section.length;
      if (nkey >= 0 && nkey <= length) {
        if (nkey === active && nkey !== 0) {
          if (isntWindows) navigate("/question/" + id + "/" + (nkey - 1));
          else navigate("/question/windows/" + id + "/" + (nkey - 1));
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [DATA.parts, id, active, navigate],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
  const windows = {
    naturalSciences: "العلوم الطبيعية",
    humanSciences: "العلوم الانسانية",
    misc: "اسئلة عامة",
    arts: "الادب والفنون",
    religion: "الدين والسيرة",
  };
  return (
    <div className="QuestionPicker">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="QuestionPicker-title">{windows[id]}</h1>
      <div className="QuestionPicker-container">
        {section.map((question, i) => (
          <IconButton
            key={i}
            done={question.done}
            active={active === i + 1}
            title={i + 1}
          />
        ))}
      </div>
    </div>
  );
}
