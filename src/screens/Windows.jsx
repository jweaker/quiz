import IconButton from "../components/IconButton";
import "./Windows.css";
import { MdMiscSoccer, MdBrush, MdPerson } from "react-icons/md";
import { GiArabicDoor, GiAtom } from "react-icons/gi";
import { FaShapes } from "react-icons/fa6";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";

export default function Windows() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const windows = [
    "religion",
    "humanSciences",
    "naturalSciences",
    "arts",
    "misc",
  ];
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 5) {
        if (nkey === active && nkey !== 0) {
          navigate("/questionpicker/" + windows[nkey - 1]);
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [active, navigate],
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);
  return (
    <div className="Windows">
      <Score right turn={rightsTurn && turned} />
      <Score turn={!rightsTurn && turned} />
      <h1 className="Windows-title">النوافذ</h1>
      <div className="Windows-container">
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
      <div className="Windows-container">
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
