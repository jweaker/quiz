import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useGlobalContext } from "../contexts/Global";
import "./Rate.css";

const toScore = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const handleScoreInput = (setter) => (event) => {
  const value = event.target.value;
  if (/^-?\d*$/.test(value)) setter(value);
};

export default function Rate() {
  const navigate = useNavigate();
  const params = useParams();
  const { setLeftScore, setRightScore, setRightsTurn, rightsTurn, DATA } =
    useGlobalContext();
  const [rjudge, setRjudge] = useState("");
  const [rguest, setRguest] = useState("");
  const [raudience, setRaudience] = useState("");
  const [ljudge, setLjudge] = useState("");
  const [lguest, setLguest] = useState("");
  const [laudience, setLaudience] = useState("");
  const type = params.type;
  const singlePuzzle = DATA.parts.puzzles.length <= 1;
  const singleRate = type === "puzzles" || type === "windows";
  const doubleTeam = type === "puzzles" ? singlePuzzle : type !== "windows";
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Enter":
          const rsum = toScore(rjudge) + toScore(rguest) + toScore(raudience);
          const lsum = toScore(ljudge) + toScore(lguest) + toScore(laudience);

          if (doubleTeam) {
            setRightScore((e) => e + rsum);
            setLeftScore((e) => e + lsum);
          } else {
            if (rightsTurn) setRightScore((e) => e + rsum);
            else setLeftScore((e) => e + rsum);
            setRightsTurn((e) => !e);
          }
          if (type === "windows") navigate(-3);
          else navigate(-2);

          break;
        default:
          break;
      }
    },
    [
      setRightsTurn,
      type,
      rightsTurn,
      navigate,
      raudience,
      rjudge,
      rguest,
      setLeftScore,
      setRightScore,
      laudience,
      ljudge,
      lguest,
      doubleTeam,
    ],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
  return (
    <motion.div
      className="Rate"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="Rate-ultra-container">
        <div className="Rate-container">
          {!singleRate && (
            <motion.div
              className="Rate-vcontainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="Rate-title">المجموع</span>
              <span className="Rate-input">
                {toScore(rjudge) + toScore(rguest) + toScore(raudience) === 0
                  ? ""
                  : toScore(rjudge) + toScore(rguest) + toScore(raudience)}
              </span>
            </motion.div>
          )}

          <motion.div
            className="Rate-vcontainer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <span
              className={"Rate-title" + (singleRate ? " Rate-title-2" : "")}
            >
              {singleRate ? "التقييم" : "الحكم"}
            </span>
            <input
              className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
              type="number"
              inputMode="numeric"
              value={rjudge}
              autoFocus
              onChange={handleScoreInput(setRjudge)}
            />
          </motion.div>
          {!singleRate && (
            <motion.div
              className="Rate-vcontainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span
                className={"Rate-title" + (singleRate ? " Rate-title-2" : "")}
              >
                الضيف
              </span>
              <input
                className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                type="number"
                inputMode="numeric"
                value={rguest}
                onChange={handleScoreInput(setRguest)}
              />
            </motion.div>
          )}
          {!singleRate && (
            <motion.div
              className="Rate-vcontainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <span className="Rate-title">الجمهور</span>
              <input
                className="Rate-input"
                type="number"
                inputMode="numeric"
                value={raudience}
                onChange={handleScoreInput(setRaudience)}
              />
            </motion.div>
          )}
        </div>
        {doubleTeam && (
          <div className="Rate-container">
            {!singleRate && (
              <motion.div
                className="Rate-vcontainer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="Rate-input">
                  {toScore(ljudge) + toScore(lguest) + toScore(laudience) === 0
                    ? ""
                    : toScore(ljudge) + toScore(lguest) + toScore(laudience)}
                </span>
              </motion.div>
            )}

            <motion.div
              className="Rate-vcontainer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <input
                className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                type="number"
                inputMode="numeric"
                value={ljudge}
                onChange={handleScoreInput(setLjudge)}
              />
            </motion.div>
            {!singleRate && (
              <motion.div
                className="Rate-vcontainer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <input
                  className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                  type="number"
                  inputMode="numeric"
                  value={lguest}
                  onChange={handleScoreInput(setLguest)}
                />
              </motion.div>
            )}
            {!singleRate && (
              <motion.div
                className="Rate-vcontainer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <input
                  className="Rate-input"
                  type="number"
                  inputMode="numeric"
                  value={laudience}
                  onChange={handleScoreInput(setLaudience)}
                />
              </motion.div>
            )}
          </div>
        )}
      </div>
      {(!singleRate || doubleTeam) && (
        <div className={"Rate-team-container"}>
          <span className={"Rate-team" + (singleRate ? " Rate-team-2" : "")}>
            {DATA.rightTeamName}
          </span>
          <span className={"Rate-team" + (singleRate ? " Rate-team-2" : "")}>
            {DATA.leftTeamName}
          </span>
        </div>
      )}
    </motion.div>
  );
}
