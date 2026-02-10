import type { IconType } from "react-icons";

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
        "rounded-[1rem] shadow-[0_8px_15px_3px_rgba(0,0,0,0.4)] transition-all duration-200 ease-in-out flex-col w-[35rem] h-[35rem] m-[1.5rem] flex items-center justify-center outline outline-0 outline-transparent" +
        (active
          ? " scale-110 -translate-y-[1.5rem] shadow-[0_10px_15px_10px_rgba(0,0,0,0.3)]"
          : "") +
        (done ? " bg-gray-500" : " bg-white")
      }
      style={{ width, height }}
    >
      {Icon && (
        <Icon className="w-[20rem] h-[20rem]" color={done ? "white" : color} />
      )}
      <span
        className={
          (Icon
            ? "text-[4.2rem] font-bold text-center" +
              (done ? " text-white" : " text-black")
            : done
              ? "text-[15rem] text-white font-bold"
              : "text-[15rem] font-bold bg-[linear-gradient(180deg,rgba(48,205,227,1)_0%,rgba(4,52,182,1)_80%)] bg-clip-text [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]")
        }
        style={{ fontSize }}
      >
        {title}
      </span>
    </div>
  );
}
