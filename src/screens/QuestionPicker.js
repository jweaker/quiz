import "./QuestionPicker.css";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import WINDOWS from "../config/windows.json";
import IconButton from "../components/IconButton";
export default function QuestionPicker() {
  const params = useParams();
  const id = parseInt(params.id);
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 5) {
        if (nkey === active && nkey !== 0) {
          navigate("/question/" + id + "/" + (nkey - 1));
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [active, navigate, id]
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
      <h1 className="QuestionPicker-title">{WINDOWS[id - 1].name}</h1>
      <div className="QuestionPicker-container">
        {WINDOWS[id - 1].questions.map((text, i) => (
          <IconButton
            key={i}
            active={active === i + 1}
            title={i + 1}
            onPress={() => console.log("1")}
          />
        ))}
      </div>
    </div>
  );
}
