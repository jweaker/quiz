import { motion } from "framer-motion";
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
  const sectionLength = section.length;
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);

      if (nkey >= 0 && nkey <= sectionLength) {
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
    [active, id, isntWindows, navigate, sectionLength],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  const windows = {
    naturalSciences: "العلوم الطبيعية",
    humanSciences: "العلوم الانسانية",
    misc: "حقل الالغام",
    arts: "الادب والفنون",
    religion: "الدين والسيرة",
  };
  return (
    <motion.div
      className="QuestionPicker"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <motion.h1
        className="QuestionPicker-title"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {windows[id]}
      </motion.h1>
      <div className="QuestionPicker-container">
        {section.map((question, i) => (
          <IconButton
            key={i}
            done={question.done}
            active={active === i + 1}
            title={i + 1}
            index={i}
          />
        ))}
      </div>
    </motion.div>
  );
}
