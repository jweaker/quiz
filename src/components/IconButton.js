import "./IconButton.css";
export default function IconButton({
  title = "",
  Icon,
  color = "dodgerblue",
  active = false, // if true, will be highlighted
}) {
  return (
    <div className={"IconButton" + (active ? " IconButton-active" : "")}>
      {Icon && <Icon className="IconButton-icon" color={color} />}
      <span
        className={"IconButton-title" + (Icon ? "" : " IconButton-title-big")}
      >
        {title}
      </span>
    </div>
  );
}
