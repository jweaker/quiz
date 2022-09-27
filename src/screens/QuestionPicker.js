import "./QuestionPicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import IconButton from "../components/IconButton";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";
export default function QuestionPicker() {
  const params = useParams();
  const id = parseInt(params.id);
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);

      const length = DATA.parts[1][id - 1].questions.length
      if (nkey >= 0 && nkey <= length) {
        if (nkey === active && nkey !== 0) {
          navigate("/question/2/" + id + "/" + (nkey - 1));
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [DATA.parts, id, active, navigate]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
  return (
    <div className="QuestionPicker">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="QuestionPicker-title">{DATA.parts[1][id - 1].name}</h1>
      <div className="QuestionPicker-container">
        {DATA.parts[1][id - 1].questions.map((text, i) => (
          <IconButton
            key={i}
            done={DATA.parts[1][id - 1].questions[i]?.done}
            active={active === i + 1}
            title={i + 1}
            onPress={() => console.log("1")}
          />
        ))}
      </div>
    </div>
  );
}
