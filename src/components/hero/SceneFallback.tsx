/** Static network composition shown when WebGL is unavailable. */
const nodes = [
  { x: 620, y: 300, r: 110, core: true },
  { x: 360, y: 170, r: 14 },
  { x: 900, y: 150, r: 14 },
  { x: 380, y: 470, r: 14 },
  { x: 880, y: 460, r: 14 },
  { x: 250, y: 110, r: 4 },
  { x: 300, y: 260, r: 5 },
  { x: 1010, y: 90, r: 4 },
  { x: 990, y: 240, r: 5 },
  { x: 260, y: 520, r: 4 },
  { x: 470, y: 560, r: 5 },
  { x: 1000, y: 540, r: 4 },
  { x: 780, y: 560, r: 5 },
];

const links: [number, number][] = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 5],
  [1, 6],
  [2, 7],
  [2, 8],
  [3, 9],
  [3, 10],
  [4, 11],
  [4, 12],
  [1, 2],
  [2, 4],
  [4, 3],
  [3, 1],
];

export default function SceneFallback() {
  return (
    <svg
      viewBox="0 0 1240 640"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
      role="img"
      aria-label="Network connecting Viximate's four services"
    >
      <defs>
        <radialGradient id="vx-fallback-core" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="var(--cs-surface-2)" />
          <stop offset="70%" stopColor="var(--cs-background)" />
          <stop offset="100%" stopColor="var(--cs-accent-2)" />
        </radialGradient>
      </defs>
      <g stroke="var(--cs-line-strong)" strokeWidth="1">
        {links.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
          />
        ))}
      </g>
      {nodes.map((n, i) => (
        <circle
          key={`${n.x}-${n.y}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={
            n.core
              ? "url(#vx-fallback-core)"
              : i < 5
                ? "var(--cs-accent)"
                : "var(--cs-foreground)"
          }
          stroke={n.core ? "var(--cs-accent-2)" : "none"}
        />
      ))}
    </svg>
  );
}
