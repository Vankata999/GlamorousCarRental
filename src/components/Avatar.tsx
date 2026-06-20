// Deterministic initials avatar: no network, no stored image. The background
// color is derived from the email so a given user always gets the same color.

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

export function Avatar({
  name,
  email,
  size = 40,
}: {
  name: string;
  email: string;
  size?: number;
}) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white select-none"
      style={{
        width: size,
        height: size,
        backgroundColor: colorFor(email || name),
        fontSize: Math.round(size * 0.4),
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
