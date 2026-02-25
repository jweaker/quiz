import "./RamadanBackground.css";

const LANTERN_COUNT = 12;
const STAR_COUNT = 25;

function createLantern(i) {
  const left = 5 + (i / LANTERN_COUNT) * 90 + Math.random() * 5;
  const delay = Math.random() * 8;
  const duration = 12 + Math.random() * 8;
  const size = 0.5 + Math.random() * 0.6;
  const swing = 15 + Math.random() * 20;
  return { left, delay, duration, size, swing, id: i };
}

function createStar(i) {
  const left = Math.random() * 100;
  const top = Math.random() * 60;
  const delay = Math.random() * 6;
  const duration = 2 + Math.random() * 3;
  const size = 2 + Math.random() * 4;
  return { left, top, delay, duration, size, id: i };
}

const lanterns = Array.from({ length: LANTERN_COUNT }, (_, i) =>
  createLantern(i),
);
const stars = Array.from({ length: STAR_COUNT }, (_, i) => createStar(i));

export default function RamadanBackground() {
  return (
    <div className="ramadan-bg">
      {/* Islamic geometric pattern overlay */}
      <div className="ramadan-bg-pattern" />

      {/* Corner arabesque decorations */}
      <div className="ramadan-bg-corner-tl" />
      <div className="ramadan-bg-corner-tr" />
      <div className="ramadan-bg-corner-bl" />
      <div className="ramadan-bg-corner-br" />

      {/* Top/bottom arabesque borders */}
      <div className="ramadan-bg-border-top" />
      <div className="ramadan-bg-border-bottom" />

      {/* Floating lanterns */}
      {lanterns.map((l) => (
        <div
          key={l.id}
          className="ramadan-lantern"
          style={{
            left: `${l.left}%`,
            animationDelay: `${l.delay}s`,
            animationDuration: `${l.duration}s`,
            transform: `scale(${l.size})`,
            "--swing": `${l.swing}px`,
          }}
        >
          <div className="ramadan-lantern-glow" />
          <div className="ramadan-lantern-body">
            <div className="ramadan-lantern-cap" />
            <div className="ramadan-lantern-glass" />
            <div className="ramadan-lantern-base" />
          </div>
        </div>
      ))}

      {/* Twinkling stars */}
      {stars.map((s) => (
        <div
          key={s.id}
          className="ramadan-star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            width: `${s.size}px`,
            height: `${s.size}px`,
          }}
        />
      ))}

      {/* Crescent moon */}
      <div className="ramadan-moon">
        <div className="ramadan-moon-glow" />
        <div className="ramadan-moon-crescent" />
      </div>
    </div>
  );
}
