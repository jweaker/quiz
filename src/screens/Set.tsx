import "./Set.css";
import DATA from "../config/data.json";
import { useShowStore } from "../state";

export default function Set() {
  const rightScore = useShowStore((state) => state.rightScore);
  const setRightScore = useShowStore((state) => state.setRightScore);
  const leftScore = useShowStore((state) => state.leftScore);
  const setLeftScore = useShowStore((state) => state.setLeftScore);
  return (
    <div className="Set">
      <div className="Rate-vcontainer">
        <span className="Rate-title Rate-title-2">{DATA.leftTeamName}</span>
        <input
          className="Rate-input Rate-input-2"
          type="number"
          value={leftScore}
          onChange={(e) => setLeftScore(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="Rate-vcontainer">
        <span className="Rate-title Rate-title-2">{DATA.rightTeamName}</span>
        <input
          className="Rate-input Rate-input-2"
          type="number"
          value={rightScore}
          onChange={(e) => setRightScore(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
