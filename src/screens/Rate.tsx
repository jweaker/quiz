import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGlobalContext } from "../contexts/Global";
import "./Rate.css";

export default function Rate() {
  const navigate = useNavigate();
  const params = useParams<{ type: string }>();
  const { setLeftScore, setRightScore, setRightsTurn, rightsTurn, DATA } =
    useGlobalContext();
  const [rjudge, setRjudge] = useState<string | undefined>();
  const [rguest, setRguest] = useState<string | undefined>();
  const [raudience, setRaudience] = useState<string | undefined>();
  const [ljudge, setLjudge] = useState<string | undefined>();
  const [lguest, setLguest] = useState<string | undefined>();
  const [laudience, setLaudience] = useState<string | undefined>();
  const type = params.type!;
  const singlePuzzle = DATA.parts.puzzles.length <= 1;
  const singleRate = type === "puzzles" || type === "windows";
  const doubleTeam = type === "puzzles" ? singlePuzzle : type !== "windows";
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "Enter": {
          const rsum =
            parseInt(rjudge ?? "0") +
            parseInt(rguest ?? "0") +
            parseInt(raudience ?? "0");
          const lsum =
            parseInt(ljudge ?? "0") +
            parseInt(lguest ?? "0") +
            parseInt(laudience ?? "0");

          if (doubleTeam) {
            setRightScore((prev) => prev + rsum);
            setLeftScore((prev) => prev + lsum);
          } else {
            if (rightsTurn) setRightScore((prev) => prev + rsum);
            else setLeftScore((prev) => prev + rsum);
            setRightsTurn((prev) => !prev);
          }
          if (type === "windows") navigate(-3);
          else navigate(-2);

          break;
        }
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
    <div className="Rate">
      <div className="Rate-ultra-container">
        <div className="Rate-container">
          {!singleRate && (
            <div className="Rate-vcontainer">
              <span className="Rate-title">المجموع</span>
              <span className="Rate-input">
                {parseInt(rjudge ?? "0") +
                  parseInt(rguest ?? "0") +
                  parseInt(raudience ?? "0") ===
                0
                  ? ""
                  : parseInt(rjudge ?? "0") +
                    parseInt(rguest ?? "0") +
                    parseInt(raudience ?? "0")}
              </span>
            </div>
          )}

          <div className="Rate-vcontainer">
            <span
              className={"Rate-title" + (singleRate ? " Rate-title-2" : "")}
            >
              {singleRate ? "التقييم" : "الحكم"}
            </span>
            <input
              className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
              type="number"
              value={rjudge ?? ""}
              onChange={(e) => setRjudge(e.target.value)}
            />
          </div>
          {!singleRate && (
            <div className="Rate-vcontainer">
              <span
                className={"Rate-title" + (singleRate ? " Rate-title-2" : "")}
              >
                الضيف
              </span>
              <input
                className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                type="number"
                value={rguest ?? ""}
                onChange={(e) => setRguest(e.target.value)}
              />
            </div>
          )}
          {!singleRate && (
            <>
              <div className="Rate-vcontainer">
                <span className="Rate-title">الجمهور</span>
                <input
                  className="Rate-input"
                  type="number"
                  value={raudience ?? ""}
                  onChange={(e) => setRaudience(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {doubleTeam && (
          <div className="Rate-container">
            {!singleRate && (
              <div className="Rate-vcontainer">
                <span className="Rate-input">
                  {parseInt(ljudge ?? "0") +
                    parseInt(lguest ?? "0") +
                    parseInt(laudience ?? "0") ===
                  0
                    ? ""
                    : parseInt(ljudge ?? "0") +
                      parseInt(lguest ?? "0") +
                      parseInt(laudience ?? "0")}
                </span>
              </div>
            )}

            <div className="Rate-vcontainer">
              <input
                className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                type="number"
                value={ljudge ?? ""}
                onChange={(e) => setLjudge(e.target.value)}
              />
            </div>
            {!singleRate && (
              <div className="Rate-vcontainer">
                <input
                  className={"Rate-input" + (singleRate ? " Rate-input-2" : "")}
                  type="number"
                  value={lguest ?? ""}
                  onChange={(e) => setLguest(e.target.value)}
                />
              </div>
            )}
            {!singleRate && (
              <>
                <div className="Rate-vcontainer">
                  <input
                    className="Rate-input"
                    type="number"
                    value={laudience ?? ""}
                    onChange={(e) => setLaudience(e.target.value)}
                  />
                </div>
              </>
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
    </div>
  );
}
