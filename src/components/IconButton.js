import "./IconButton.css";

export default function IconButton({
  title = "",
  Icon,
  color = "#D4A853",
  width,
  height,
  fontSize,
  done = false,
  active = false,
  danger = false,
  index = 0,
}) {
  return (
    <div
      className={
        "IconButton" +
        (danger ? " IconButton-danger" : "") +
        (active ? " IconButton-active" : "") +
        (done ? " IconButton-done" : "")
      }
      style={{
        width,
        height,
        animationDelay: `${index * 0.06}s`,
      }}
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
