import { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useShowStore } from "../state";

export default function Rate() {
  const navigate = useNavigate();
  const params = useParams<{ type: string }>();
  const addLeftScore = useShowStore((state) => state.addLeftScore);
  const addRightScore = useShowStore((state) => state.addRightScore);
  const setRightsTurn = useShowStore((state) => state.setRightsTurn);
  const rightsTurn = useShowStore((state) => state.rightsTurn);
  const data = useShowStore((state) => state.data);

  if (!data) return null;
  const DATA = data;
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
            addRightScore(rsum);
            addLeftScore(lsum);
          } else {
            if (rightsTurn) addRightScore(rsum);
            else addLeftScore(rsum);
            setRightsTurn(!rightsTurn);
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
      addLeftScore,
      addRightScore,
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
    <div className="w-full h-full flex justify-center items-center flex-row [animation:starta_0.5s_ease-in-out_forwards_1] scale-0 translate-y-[500px] blur-[1.5rem]">
      <div className="flex flex-col justify-center items-center">
        <div className="flex justify-center items-center flex-row w-full p-0">
          {!singleRate && (
            <div className="flex justify-center items-center flex-col m-[1.5rem]">
              <span className="text-white text-[8rem] m-0 [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">المجموع</span>
              <span className="western-numerals w-[30rem] h-[30rem] rounded-[2rem] outline-none bg-white border-none text-[16rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] flex items-center justify-center">
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

          <div className="flex justify-center items-center flex-col m-[1.5rem]">
            <span
              className={
                "text-white [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]" +
                (singleRate ? " text-[10rem] mb-0 -mt-[14rem]" : " text-[8rem] m-0")
              }
            >
              {singleRate ? "التقييم" : "الحكم"}
            </span>
            <input
              className={
                "western-numerals rounded-[2rem] outline-none bg-white border-none text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none" +
                (singleRate ? " w-[40rem] h-[40rem] text-[18rem]" : " w-[30rem] h-[30rem] text-[16rem]")
              }
              type="number"
              value={rjudge ?? ""}
              onChange={(e) => setRjudge(e.target.value)}
            />
          </div>
          {!singleRate && (
            <div className="flex justify-center items-center flex-col m-[1.5rem]">
              <span
                className="text-white text-[8rem] m-0 [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]"
              >
                الضيف
              </span>
              <input
                className="western-numerals w-[30rem] h-[30rem] rounded-[2rem] outline-none bg-white border-none text-[16rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none"
                type="number"
                value={rguest ?? ""}
                onChange={(e) => setRguest(e.target.value)}
              />
            </div>
          )}
          {!singleRate && (
            <>
              <div className="flex justify-center items-center flex-col m-[1.5rem]">
                <span className="text-white text-[8rem] m-0 [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">الجمهور</span>
                <input
                  className="western-numerals w-[30rem] h-[30rem] rounded-[2rem] outline-none bg-white border-none text-[16rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none"
                  type="number"
                  value={raudience ?? ""}
                  onChange={(e) => setRaudience(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
        {doubleTeam && (
          <div className="flex justify-center items-center flex-row w-full p-0">
            {!singleRate && (
              <div className="flex justify-center items-center flex-col m-[1.5rem]">
                <span className="western-numerals w-[30rem] h-[30rem] rounded-[2rem] outline-none bg-white border-none text-[16rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] flex items-center justify-center">
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

            <div className="flex justify-center items-center flex-col m-[1.5rem]">
              <input
                className={
                  "western-numerals rounded-[2rem] outline-none bg-white border-none text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none" +
                  (singleRate ? " w-[40rem] h-[40rem] text-[18rem]" : " w-[30rem] h-[30rem] text-[16rem]")
                }
                type="number"
                value={ljudge ?? ""}
                onChange={(e) => setLjudge(e.target.value)}
              />
            </div>
            {!singleRate && (
              <div className="flex justify-center items-center flex-col m-[1.5rem]">
                <input
                  className={
                    "western-numerals rounded-[2rem] outline-none bg-white border-none text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none" +
                    (singleRate ? " w-[40rem] h-[40rem] text-[18rem]" : " w-[30rem] h-[30rem] text-[16rem]")
                  }
                  type="number"
                  value={lguest ?? ""}
                  onChange={(e) => setLguest(e.target.value)}
                />
              </div>
            )}
            {!singleRate && (
              <>
                <div className="flex justify-center items-center flex-col m-[1.5rem]">
                  <input
                    className="western-numerals w-[30rem] h-[30rem] rounded-[2rem] outline-none bg-white border-none text-[16rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none"
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
        <div className="flex justify-center items-center flex-col m-0 -me-[5rem]">
          <span className={
            "text-white [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]" +
            (singleRate ? " text-[7rem] mb-[10rem] mt-[10rem]" : " text-[7rem] mb-[2rem] mt-[9.5rem]")
          }>
            {DATA.rightTeamName}
          </span>
          <span className={
            "text-white [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]" +
            (singleRate ? " text-[7rem] mb-[10rem] mt-[10rem]" : " text-[7rem] mb-[2rem] mt-[9.5rem]")
          }>
            {DATA.leftTeamName}
          </span>
        </div>
      )}
    </div>
  );
}
