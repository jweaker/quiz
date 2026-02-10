import DATA from "../config/data.json";
import { useShowStore } from "../state";

export default function Set() {
  const rightScore = useShowStore((state) => state.rightScore);
  const setRightScore = useShowStore((state) => state.setRightScore);
  const leftScore = useShowStore((state) => state.leftScore);
  const setLeftScore = useShowStore((state) => state.setLeftScore);
  return (
    <div className="w-full h-full flex justify-center items-center flex-row [animation:starta_0.5s_ease-in-out_forwards_1] scale-0 translate-y-[500px] blur-[1.5rem]">
      <div className="flex justify-center items-center flex-col m-[1.5rem]">
        <span className="text-white text-[10rem] mb-0 -mt-[14rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">{DATA.leftTeamName}</span>
        <input
          className="western-numerals w-[40rem] h-[40rem] rounded-[2rem] outline-none bg-white border-none text-[18rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none"
          type="number"
          value={leftScore}
          onChange={(e) => setLeftScore(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="flex justify-center items-center flex-col m-[1.5rem]">
        <span className="text-white text-[10rem] mb-0 -mt-[14rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">{DATA.rightTeamName}</span>
        <input
          className="western-numerals w-[40rem] h-[40rem] rounded-[2rem] outline-none bg-white border-none text-[18rem] text-center shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)] focus:border-none"
          type="number"
          value={rightScore}
          onChange={(e) => setRightScore(parseInt(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}
