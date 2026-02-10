import { useEffect, useState } from "react";
import { useShowStore } from "../state";

interface ScoreProps {
  right?: boolean;
  turn?: boolean;
  top?: boolean;
  overlay?: boolean;
  zero?: boolean;
}

export default function Score({
  right = false,
  turn,
  top = false,
  overlay = false,
  zero = false,
}: ScoreProps) {
  const leftScore = useShowStore((state) => state.leftScore);
  const rightScore = useShowStore((state) => state.rightScore);
  const setRightScore = useShowStore((state) => state.setRightScore);
  const setLeftScore = useShowStore((state) => state.setLeftScore);
  const data = useShowStore((state) => state.data);

  const mscore = right ? rightScore : leftScore;
  const mset = right ? setRightScore : setLeftScore;
  const [init, setInit] = useState<number>(0);
  useEffect(() => {
    if (zero && !init) setInit(mscore);
  });
  console.log(mscore);

  if (!data) return null;

  const rightTeamName = data.rightTeamName;
  const leftTeamName = data.leftTeamName;
  const teamName = right ? rightTeamName : leftTeamName;
  const hide = overlay && !turn;
  if (hide) return null;
  return (
    <div
      className={
        "fixed flex items-center justify-center flex-col m-[0.2rem] mx-[1rem]" +
        (right && !overlay ? " right-[-12rem]" : !overlay ? " left-[-12rem]" : "") +
        (top || overlay ? " top-0" : " bottom-[10rem]") +
        (overlay ? " z-[99] opacity-75 scale-[0.65] translate-x-[-6vh] translate-y-[-6vh]" : "")
      }
    >
      <input
        type="text"
        className="text-[6rem] bg-transparent font-[Cairo,monospace] outline-none mb-[2rem] text-center border-none [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)] text-white"
        defaultValue={teamName}
      />
      <div
        className={
          "w-[18rem] h-[18rem] m-0 -mt-[1rem] bg-white flex rounded-[1rem] items-center justify-center text-[6rem] p-[0.5rem] font-bold" +
          (turn
            ? " shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] outline outline-[30px] outline-[tomato] transition-all duration-200 ease-linear"
            : "")
        }
      >
        <input
          type="number"
          className="western-numerals bg-[linear-gradient(180deg,rgb(28,117,129)_0%,rgb(4,28,95)_80%)] w-full h-full text-[10rem] outline-none border-none text-center bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]"
          value={mscore - init}
          onChange={(e) => mset(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
