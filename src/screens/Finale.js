import { motion } from "framer-motion";
import { useGlobalContext } from "../contexts/Global";
import "@fontsource/aref-ruqaa/arabic-700.css";
import logo from "../assets/logom.png";
import "./Finale.css";

const getScore = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default function Finale() {
  const { rightScore, leftScore, DATA } = useGlobalContext();
  const safeRightScore = getScore(rightScore);
  const safeLeftScore = getScore(leftScore);
  const winner =
    safeRightScore === safeLeftScore
      ? null
      : safeRightScore > safeLeftScore
        ? "right"
        : "left";

  const winnerLabel = winner
    ? `الفائز: ${winner === "right" ? DATA.rightTeamName : DATA.leftTeamName}`
    : "تعادل";

  return (
    <motion.div
      className="Finale"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.03 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      <div className="Finale-aurora Finale-aurora-left" />
      <div className="Finale-aurora Finale-aurora-right" />

      <motion.img
        className="Finale-logo"
        src={logo}
        alt="شعار بشائر المعرفة"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      />

      <motion.h1
        className="Finale-title"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        النتيجة النهائية
      </motion.h1>

      <motion.div
        className="Finale-board"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <article
          className={
            "Finale-teamCard Finale-teamCard-right" +
            (winner === "right" ? " Finale-teamCard-winner" : "")
          }
        >
          <span className="Finale-teamName">{DATA.rightTeamName}</span>
          <span className="Finale-teamScore">{safeRightScore}</span>
        </article>

        <div className="Finale-divider">:</div>

        <article
          className={
            "Finale-teamCard Finale-teamCard-left" +
            (winner === "left" ? " Finale-teamCard-winner" : "")
          }
        >
          <span className="Finale-teamName">{DATA.leftTeamName}</span>
          <span className="Finale-teamScore">{safeLeftScore}</span>
        </article>
      </motion.div>

      <motion.p
        className="Finale-winnerLabel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4 }}
      >
        {winnerLabel}
      </motion.p>
    </motion.div>
  );
}
