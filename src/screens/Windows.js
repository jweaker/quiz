import IconButton from "../components/IconButton";
import "./Windows.css";
import { MdSportsSoccer, MdBrush, MdPerson } from "react-icons/md";
import { GiArabicDoor, GiAtom } from "react-icons/gi";
import { RiQuestionMark } from "react-icons/ri";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Score from "../components/Score";
import { useGlobalContext } from "../contexts/Global";

export default function Windows() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const { DATA, rightsTurn, turned } = useGlobalContext();
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 6) {
        if (nkey === active && nkey !== 0) {
          console.log("asdf");
          navigate("/questionpicker/" + nkey);
        } else setActive(nkey);
      } else
        switch (e.key) {
          default:
            break;
        }
    },
    [active, navigate]
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
          title="العلوم الطبيعية"
          Icon={GiAtom}
          done={
            DATA.parts[1][0].questions[0]?.done &&
            DATA.parts[1][0].questions[1]?.done
          }
          active={active === 1}
        />
        <IconButton
          title="العلوم الانسانية"
          Icon={MdPerson}
          done={
            DATA.parts[1][1].questions[0]?.done &&
            DATA.parts[1][1].questions[1]?.done
          }
          active={active === 2}
        />
        <IconButton
          title="الرياضة"
          Icon={MdSportsSoccer}
          done={
            DATA.parts[1][2].questions[0]?.done &&
            DATA.parts[1][2].questions[1]?.done
          }
          active={active === 3}
        />
      </div>
      <div className="Windows-container">
        <IconButton
          title="الأدب و الفنون"
          Icon={MdBrush}
          done={
            DATA.parts[1][3].questions[0]?.done &&
            DATA.parts[1][3].questions[1]?.done
          }
          active={active === 4}
        />
        <IconButton
          title="الدين و السيرة"
          Icon={GiArabicDoor}
          done={
            DATA.parts[1][4].questions[0]?.done &&
            DATA.parts[1][4].questions[1]?.done
          }
          active={active === 5}
        />
        <IconButton
          title="اسئلة بديلة"
          Icon={RiQuestionMark}
          done={
            DATA.parts[1][5].questions[0]?.done &&
            DATA.parts[1][5].questions[1]?.done
          }
          active={active === 6}
        />
      </div>
    </div>
  );
}
