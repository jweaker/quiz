import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalContext } from "../contexts/Global";
import "./Rate.css";

export default function Rate() {
  const navigate = useNavigate();
  const { rightsTurn, setRightsTurn } = useGlobalContext();
  const params = useParams();
  const { setLeftScore, setRightScore, DATA } = useGlobalContext();
  const [rjudje, setRjudje] = useState();
  const [rguest, seRguest] = useState();
  const [raudience, SetRaudience] = useState();
  const [ljudje, setLjudje] = useState();
  const [lguest, setLguest] = useState();
  const [laudience, setLaudience] = useState();
  const type = parseInt(params.type);
  const handleKeyDown = useCallback(
    (e) => {
      switch (e.key) {
        case "Enter":
          const rsum =
            parseInt(rjudje ?? 0) +
            parseInt(rguest ?? 0) +
            parseInt(raudience ?? 0);
          if (type === 2) {
            if (rightsTurn) setRightScore((e) => e + rsum);
            else setLeftScore((e) => e + rsum);
            setRightsTurn((e) => !e);
            navigate(-3);
          } else {
            setRightScore((e) => e + rsum);

            const lsum =
              parseInt(ljudje ?? 0) +
              parseInt(lguest ?? 0) +
              parseInt(laudience ?? 0);
            setLeftScore((e) => e + lsum);
            navigate(-2);
          }
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
      rjudje,
      rguest,
      setLeftScore,
      setRightScore,
      laudience,
      ljudje,
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
          {type !== 2 && (
            <div className="Rate-vcontainer">
              <span className="Rate-title">المجموع</span>
              <span className="Rate-input">
                {parseInt(rjudje ?? 0) +
                  parseInt(rguest ?? 0) +
                  parseInt(raudience ?? 0) ===
                0
                  ? ""
                  : parseInt(rjudje ?? 0) +
                    parseInt(rguest ?? 0) +
                    parseInt(raudience ?? 0)}
              </span>
            </div>
          )}
          <div className="Rate-vcontainer">
            <span
              className={"Rate-title" + (type === 2 ? " Rate-title-2" : "")}
            >
              {type === 2 ? "التقييم" : "الحكم"}
            </span>
            <input
              className={"Rate-input" + (type === 2 ? " Rate-input-2" : "")}
              type="number"
              value={rjudje}
              onChange={(e) => setRjudje(e.target.value)}
            />
          </div>
          {type !== 2 && (
            <>
              
              <div className="Rate-vcontainer">
                <span className="Rate-title">الجمهور</span>
                <input
                  className="Rate-input"
                  type="number"
                  value={raudience}
                  onChange={(e) => SetRaudience(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {type !== 2 && (
          <div className="Rate-container">
            <div className="Rate-vcontainer">
              <span className="Rate-input">
                {parseInt(ljudje ?? 0) +
                  parseInt(lguest ?? 0) +
                  parseInt(laudience ?? 0) ===
                0
                  ? ""
                  : parseInt(ljudje ?? 0) +
                    parseInt(lguest ?? 0) +
                    parseInt(laudience ?? 0)}
              </span>
            </div>
            <div className="Rate-vcontainer">
              <input
                className="Rate-input"
                type="number"
                value={ljudje}
                onChange={(e) => setLjudje(e.target.value)}
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
        )}
      </div>
      {type !== 2 && (
        <div className="Rate-team-container">
          <span className="Rate-team">{DATA.rightTeamName}</span>
          <span className="Rate-team">{DATA.leftTeamName}</span>
        </div>
      )}
    </div>
  );
}
