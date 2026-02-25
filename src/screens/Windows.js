import { motion } from "framer-motion";
import IconButton from "../components/IconButton";
import "./Windows.css";
import { MdBrush, MdPerson } from "react-icons/md";
import { GiArabicDoor, GiAtom } from "react-icons/gi";
import { FaShapes } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";

const WINDOW_KEYS = [
  "religion",
  "humanSciences",
  "naturalSciences",
  "arts",
  "misc",
];

export default function Windows() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 5) {
        if (nkey === active && nkey !== 0) {
          navigate("/questionpicker/" + WINDOW_KEYS[nkey - 1]);
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [active, navigate],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <motion.div
      className="Windows"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <motion.h1
        className="Windows-title"
        initial={{ opacity: 0, y: -25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        نوافذ المعرفة
      </motion.h1>
      <div className="Windows-container">
        <IconButton
          title="الدين و السيرة"
          Icon={GiArabicDoor}
          done={
            DATA.parts.windows.religion[0]?.done &&
            DATA.parts.windows.religion[1]?.done
          }
          active={active === 1}
          index={0}
        />
        <IconButton
          title="العلوم الانسانية"
          Icon={MdPerson}
          done={
            DATA.parts.windows.humanSciences[0]?.done &&
            DATA.parts.windows.humanSciences[1]?.done
          }
          active={active === 2}
          index={1}
        />
        <IconButton
          title="العلوم الطبيعية"
          Icon={GiAtom}
          done={
            DATA.parts.windows.naturalSciences[0]?.done &&
            DATA.parts.windows.naturalSciences[1]?.done
          }
          active={active === 3}
          index={2}
        />
      </div>
      <div className="Windows-container">
        <IconButton
          title="الأدب و الفنون"
          Icon={MdBrush}
          done={
            DATA.parts.windows.arts[0]?.done && DATA.parts.windows.arts[1]?.done
          }
          active={active === 4}
          index={3}
        />
        <IconButton
          title="حقل الالغام"
          Icon={FaShapes}
          color="#D66754"
          danger
          done={
            DATA.parts.windows.misc[0]?.done && DATA.parts.windows.misc[1]?.done
          }
          active={active === 5}
          index={4}
        />
      </div>
    </motion.div>
  );
}
