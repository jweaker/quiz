import "./Set.css";
import DATA from "../config/data.json";
import { useGlobalContext } from "../contexts/Global";

const toScore = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

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
          inputMode="numeric"
          onChange={(e) => setLeftScore(toScore(e.target.value))}
        />
      </div>
      <div className="Rate-vcontainer">
        <span className="Rate-title Rate-title-2">{DATA.rightTeamName}</span>
        <input
          className="Rate-input Rate-input-2"
          type="number"
          value={rightScore}
          inputMode="numeric"
          onChange={(e) => setRightScore(toScore(e.target.value))}
        />
      </div>
    </div>
  );
}
