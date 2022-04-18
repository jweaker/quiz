import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGlobalContext } from "../contexts/Global";
import "./Rate.css";
import DATA from "../config/data.json";

export default function Rate() {
  const navigate = useNavigate();
  const { setLeftScore, setRightScore } = useGlobalContext();
  const [rjudje, setRjudje] = useState();
  const [rguest, seRguest] = useState();
  const [raudience, SetRaudience] = useState();
  const [rJudje, setLjudje] = useState();
  const [lguest, setLguest] = useState();
  const [laudience, setLaudience] = useState();
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Enter":
          const rsum =
            parseInt(rjudje ?? 0) +
            parseInt(rguest ?? 0) +
            parseInt(raudience ?? 0);
          setRightScore((e) => e + rsum);
          const lsum =
            parseInt(rJudje ?? 0) +
            parseInt(lguest ?? 0) +
            parseInt(laudience ?? 0);
          setLeftScore((e) => e + lsum);
          navigate(-2);
          break;
        default:
          break;
      }
    },
    [
      navigate,
      raudience,
      rjudje,
      rguest,
      setLeftScore,
      setRightScore,
      laudience,
      rJudje,
      lguest,
    ]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
  return (
    <div className="Rate">
      <div className="Rate-ultra-container">
        <div className="Rate-container">
          <div className="Rate-vcontainer">
            <span className="Rate-title">الحكم</span>
            <input
              className="Rate-input"
              type="number"
              value={rjudje}
              onChange={(e) => setRjudje(e.target.value)}
            />
          </div>
          <div className="Rate-vcontainer">
            <span className="Rate-title">الضيف</span>
            <input
              className="Rate-input"
              type="number"
              value={rguest}
              onChange={(e) => seRguest(e.target.value)}
            />
          </div>
          <div className="Rate-vcontainer">
            <span className="Rate-title">الجمهور</span>
            <input
              className="Rate-input"
              type="number"
              value={raudience}
              onChange={(e) => SetRaudience(e.target.value)}
            />
          </div>
        </div>
        <div className="Rate-container">
          <div className="Rate-vcontainer">
            <input
              className="Rate-input"
              type="number"
              value={rJudje}
              onChange={(e) => setLjudje(e.target.value)}
            />
          </div>
          <div className="Rate-vcontainer">
            <input
              className="Rate-input"
              type="number"
              value={lguest}
              onChange={(e) => setLguest(e.target.value)}
            />
          </div>
          <div className="Rate-vcontainer">
            <input
              className="Rate-input"
              type="number"
              value={laudience}
              onChange={(e) => setLaudience(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="Rate-team-container">
        <span className="Rate-team">{DATA.rightTeamName}</span>
        <span className="Rate-team">{DATA.leftTeamName}</span>
      </div>
    </div>
  );
}
