export const TINTS = [
  ["#fb7185", "#fb923c"],
  ["#7c3aed", "#d946ef"],
  ["#06b6d4", "#2563eb"],
  ["#10b981", "#14b8a6"],
  ["#f59e0b", "#ec4899"],
  ["#6366f1", "#38bdf8"],
];

export const tintOf = (ev, i) =>
  i ?? parseInt(ev?._id?.slice(-2) || "0", 16) % TINTS.length;

// event image if present, otherwise a coloured gradient with the first letter
export default function Poster({
  ev,
  i,
  className = "",
  letter = "text-7xl",
  children,
}) {
  const t = TINTS[tintOf(ev, i) % TINTS.length];
  const style = ev?.image
    ? {
        backgroundImage: `url(${ev.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { background: `linear-gradient(135deg, ${t[0]}, ${t[1]})` };
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="z absolute inset-0 grid place-items-center text-white font-black"
        style={style}
      >
        {!ev?.image && (
          <span className={`${letter} drop-shadow`}>
            {ev?.name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
