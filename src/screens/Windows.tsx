import IconButton from "../components/IconButton";
import { MdBrush, MdPerson } from "react-icons/md";
import { GiArabicDoor, GiAtom } from "react-icons/gi";
import { FaShapes } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Score from "../components/Score";
import { useShowStore } from "../state";

const WINDOWS = [
  "religion",
  "humanSciences",
  "naturalSciences",
  "arts",
  "misc",
] as const;

export default function Windows() {
  const navigate = useNavigate();
  const [active, setActive] = useState<number>(0);
  const DATA = useShowStore((s) => s.data);
  const rightsTurn = useShowStore((s) => s.rightsTurn);
  const turned = useShowStore((s) => s.turned);

  if (!DATA) return null;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 5) {
        if (nkey === active && nkey !== 0) {
          navigate("/questionpicker/" + WINDOWS[nkey - 1]);
        } else setActive(nkey);
      }
    },
    [active, navigate],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <div className="w-screen h-screen m-0 p-0 flex flex-col items-center justify-center [animation:starta_0.5s_ease-in-out_forwards_1] scale-0 translate-y-[500px] blur-[1.5rem]">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="text-white text-[15rem] m-0 mt-[4rem] [text-shadow:0px_5px_10px_rgba(0,0,0,0.6)]">النوافذ</h1>
      <div className="w-full m-0 p-0 flex justify-center items-center flex-row-reverse">
        <IconButton
          title="الدين و السيرة"
          Icon={GiArabicDoor}
          done={
            DATA.parts.windows.religion[0]?.done &&
            DATA.parts.windows.religion[1]?.done
          }
          active={active === 1}
        />
        <IconButton
          title="العلوم الانسانية"
          Icon={MdPerson}
          done={
            DATA.parts.windows.humanSciences[0]?.done &&
            DATA.parts.windows.humanSciences[1]?.done
          }
          active={active === 2}
        />
        <IconButton
          title="العلوم الطبيعية"
          Icon={GiAtom}
          done={
            DATA.parts.windows.naturalSciences[0]?.done &&
            DATA.parts.windows.naturalSciences[1]?.done
          }
          active={active === 3}
        />
      </div>
      <div className="w-full m-0 p-0 flex justify-center items-center flex-row-reverse">
        <IconButton
          title="الأدب و الفنون"
          Icon={MdBrush}
          done={
            DATA.parts.windows.arts[0]?.done && DATA.parts.windows.arts[1]?.done
          }
          active={active === 4}
        />
        <IconButton
          title="اسئلة عامة"
          Icon={FaShapes}
          done={
            DATA.parts.windows.misc[0]?.done && DATA.parts.windows.misc[1]?.done
          }
          active={active === 5}
        />
      </div>
    </div>
  );
}
