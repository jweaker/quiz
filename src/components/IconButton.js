import "./IconButton.css";
export default function IconButton({
  title = "",
  Icon,
  color = "dodgerblue",
  width,
  height,
  fontSize,
  active = false, // if true, will be highlighted
}) {
  return (
    <div
      className={"IconButton" + (active ? " IconButton-active" : "")}
      style={{ width, height }}
    >
      {Icon && <Icon className="IconButton-icon" color={color} />}
      <span
        className={"IconButton-title" + (Icon ? "" : " IconButton-title-big")}
        style={{ fontSize }}
      >
        {title}
      </span>
    </div>
  );
}
