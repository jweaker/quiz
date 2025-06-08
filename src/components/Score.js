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
  const [init, setInit] = useState(0);
  useEffect(() => {
    if (zero && !init) setInit(mscore);
  });
  console.log(mscore);
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
          value={mscore - init}
          onChange={(e) => mset(parseInt(e.target.value))}
        />
      </div>
    </div>
  );
}
