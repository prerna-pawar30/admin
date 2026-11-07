import { useState } from "react";

/** Coloured initials avatar (or the photo when one is given and loads). Colour is stable per name. */
const COLORS = ["#e68736", "#0ea5e9", "#8b5cf6", "#10b981", "#f43f5e", "#f59e0b", "#6366f1", "#14b8a6"];

const colorFor = (text = "") => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length];
};

const initialsOf = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "?";

export default function InitialsAvatar({ name = "", src = "", className = "h-10 w-10 text-xs" }) {
  const [failed, setFailed] = useState(false);
  if (src && !failed) {
    return <img src={src} alt="" onError={() => setFailed(true)} className={`shrink-0 rounded-xl bg-slate-50 object-cover ring-1 ring-slate-200 ${className}`} />;
  }
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-xl font-bold text-white ${className}`} style={{ background: colorFor(name) }} aria-hidden>
      {initialsOf(name)}
    </span>
  );
}
