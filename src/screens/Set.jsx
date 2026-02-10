import "./Set.css";
import DATA from "../config/data.json";
import { useGlobalContext } from "../contexts/Global";
export default function Set() {
  const { rightScore, setRightScore, leftScore, setLeftScore } =
    useGlobalContext();
  return (
    <div className="Set">
      <div className="Rate-vcontainer">
        <span className="Rate-title Rate-title-2">{DATA.leftTeamName}</span>
        <input
          className="Rate-input Rate-input-2"
          type="number"
          value={leftScore}
          onChange={(e) => setLeftScore(e.target.value)}
        />
      </div>
      <div className="Rate-vcontainer">
        <span className="Rate-title Rate-title-2">{DATA.rightTeamName}</span>
        <input
          className="Rate-input Rate-input-2"
          type="number"
          value={rightScore}
          onChange={(e) => setRightScore(e.target.value)}
        />
      </div>
    </div>
  );
}
