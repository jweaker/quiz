import type { IconType } from "react-icons";
import "./IconButton.css";

interface IconButtonProps {
  title?: string;
  Icon?: IconType;
  color?: string;
  width?: string;
  height?: string;
  fontSize?: string;
  done?: boolean;
  active?: boolean;
}

export default function IconButton({
  title = "",
  Icon,
  color = "dodgerblue",
  width,
  height,
  fontSize,
  done = false,
  active = false,
}: IconButtonProps) {
  return (
    <div
      className={
        "IconButton" +
        (active ? " IconButton-active" : "") +
        (done ? " IconButton-done" : "")
      }
      style={{ width, height }}
    >
      {Icon && (
        <Icon className="IconButton-icon" color={done ? "white" : color} />
      )}
      <span
        className={
          "IconButton-title" +
          (Icon
            ? ""
            : done
              ? " IconButton-title-done"
              : " IconButton-title-big")
        }
        style={{ fontSize }}
      >
        {title}
      </span>
    </div>
  );
}
