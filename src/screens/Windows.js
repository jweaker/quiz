import IconButton from "../components/IconButton";
import "./Windows.css";
import { MdSportsSoccer, MdBrush, MdPerson } from "react-icons/md";
import { GiArabicDoor, GiAtom } from "react-icons/gi";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Windows() {
  const navigate = useNavigate();
  const [active, setActive] = useState(0);
  const handleKeyDown = useCallback(
    (e) => {
      console.log(e.key);
      const nkey = parseInt(e.key);
      if (nkey >= 0 && nkey <= 5) {
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
      <h1 className="Windows-title">النوافذ</h1>
      <div className="Windows-container">
        <IconButton
          title="العلوم الطبيعية"
          Icon={GiAtom}
          active={active === 1}
        />
        <IconButton
          title="العلوم البشرية"
          Icon={MdPerson}
          active={active === 2}
        />
      </div>
      <div className="Windows-container">
        <IconButton
          title="الرياضة"
          Icon={MdSportsSoccer}
          active={active === 3}
        />
        <IconButton
          title="الأدب و الفنون"
          Icon={MdBrush}
          active={active === 4}
        />
        <IconButton title="الدين" Icon={GiArabicDoor} active={active === 5} />
      </div>
    </div>
  );
}
