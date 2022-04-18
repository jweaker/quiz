import { useGlobalContext } from "../contexts/Global";
import "./Score.css";
import DATA from "../config/data.json";
export default function Score({ right = false }) {
  const { leftScore, rightScore } = useGlobalContext();
  const mscore = right ? rightScore : leftScore;
  const rightTeamName = DATA.rightTeamName;
  const leftTeamName = DATA.leftTeamName;
  const teamName = right ? rightTeamName : leftTeamName;
  return (
    <div className={"Score" + (right ? " Score-right" : " Score-left")}>
      <h1 className="Score-name">
        {teamName}
        {right}
      </h1>
      <div className="Score-score">
        <span className="Score-score-score">{mscore}</span>
      </div>
    </div>
  );
}
