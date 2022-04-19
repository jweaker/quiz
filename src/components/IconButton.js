import "./IconButton.css";
export default function IconButton({
  title = "",
  Icon,
  color = "dodgerblue",
  width,
  height,
  fontSize,
  done = false,
  active = false, // if true, will be highlighted
}) {
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
