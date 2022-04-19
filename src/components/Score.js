import { useGlobalContext } from "../contexts/Global";
import "./Score.css";

export default function Score({ right = false, turn }) {
  const { leftScore, rightScore, setRightScore, setLeftScore, DATA } =
    useGlobalContext();
  const mscore = right ? rightScore : leftScore;
  const mset = right ? setRightScore : setLeftScore;
  const rightTeamName = DATA.rightTeamName;
  const leftTeamName = DATA.leftTeamName;
  const teamName = right ? rightTeamName : leftTeamName;
  return (
    <div className={"Score" + (right ? " Score-right" : " Score-left")}>
      <h1 className="Score-name">
        {teamName}
        {right}
      </h1>
      <div className={"Score-score" + (turn ? " Score-score-turn" : "")}>
        <input
          type="number"
          className="Score-score-score"
          value={mscore}
          onChange={(e) => mset(e.target.value)}
        />
      </div>
    </div>
  );
}
