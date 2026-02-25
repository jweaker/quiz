import { useEffect, useState } from "react";
import { useGlobalContext } from "../contexts/Global";
import "./Score.css";

export default function Score({
  right = false,
  turn,
  top = false,
  overlay = false,
  zero = false,
}) {
  const { leftScore, rightScore, setRightScore, setLeftScore, DATA } =
    useGlobalContext();
  const mscore = right ? rightScore : leftScore;
  const mset = right ? setRightScore : setLeftScore;
  const normalizedScore = Number.isFinite(Number(mscore)) ? Number(mscore) : 0;
  const [init, setInit] = useState(null);
  useEffect(() => {
    if (zero && init === null) setInit(normalizedScore);
  }, [zero, init, normalizedScore]);

  const baseScore = zero ? (init ?? 0) : 0;
  const displayScore = normalizedScore - (init ?? 0);
  const handleScoreChange = (event) => {
    const raw = event.target.value;
    if (raw === "") {
      mset(baseScore);
      return;
    }
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isFinite(parsed)) return;
    mset(baseScore + parsed);
  };

  const rightTeamName = DATA.rightTeamName;
  const leftTeamName = DATA.leftTeamName;
  const teamName = right ? rightTeamName : leftTeamName;
  const hide = overlay && !turn;
  if (hide) return null;
  return (
    <div
      className={
        "Score" +
        (right && !overlay ? " Score-right" : " Score-left") +
        (top || overlay ? " Score-top" : " Score-bottom") +
        (overlay ? " Score-overlay" : "")
      }
    >
      <input type="text" className="Score-name" defaultValue={teamName} />
      <div className={"Score-score" + (turn ? " Score-score-turn" : "")}>
        <input
          type="number"
          className="Score-score-score"
          inputMode="numeric"
          value={displayScore}
          onChange={handleScoreChange}
        />
      </div>
    </div>
  );
}
