const INPUTS = [
  { label: "Web form", y: 70 },
  { label: "Inbox", y: 210 },
  { label: "CRM", y: 350 },
];
const OUTPUTS = [
  { label: "Notify team", y: 90 },
  { label: "Update CRM", y: 210 },
  { label: "Send invoice", y: 330 },
];
const CORE = { x: 320, y: 210 };

const inPath = (y: number) =>
  `M118 ${y} C 210 ${y}, 220 ${CORE.y}, ${CORE.x - 46} ${CORE.y}`;
const outPath = (y: number) =>
  `M${CORE.x + 46} ${CORE.y} C 420 ${CORE.y}, 430 ${y}, 522 ${y}`;

const LOG = [
  ["lead.received", "web-form"],
  ["ai.classify", "intent: quote"],
  ["ai.enrich", "company matched"],
  ["crm.update", "stage → qualified"],
  ["notify.team", "#sales"],
];

/** Automation & AI — a live workflow: triggers flow through an AI agent into actions. */
export default function AIVisual() {
  return (
    <div className="vis vis-ai" aria-hidden="true">
      <div className="vis-layer vis-ai-graph" data-depth="0.8">
        <svg
          aria-hidden="true"
          viewBox="0 0 640 420"
          className="h-full w-full overflow-visible"
        >
          <defs>
            {INPUTS.map((n, i) => (
              <path key={n.label} id={`vx-ai-in-${i}`} d={inPath(n.y)} />
            ))}
            {OUTPUTS.map((n, i) => (
              <path key={n.label} id={`vx-ai-out-${i}`} d={outPath(n.y)} />
            ))}
          </defs>

          <g className="vis-ai-links">
            {INPUTS.map((n) => (
              <path key={n.label} d={inPath(n.y)} />
            ))}
            {OUTPUTS.map((n) => (
              <path key={n.label} d={outPath(n.y)} />
            ))}
          </g>

          {/* packets */}
          {INPUTS.map((n, i) => (
            <circle key={`p-in-${n.label}`} r="4.5" className="vis-packet">
              <animateMotion
                dur="2.6s"
                begin={`${i * 0.7}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#vx-ai-in-${i}`} />
              </animateMotion>
            </circle>
          ))}
          {OUTPUTS.map((n, i) => (
            <circle
              key={`p-out-${n.label}`}
              r="4.5"
              className="vis-packet vis-packet--alt"
            >
              <animateMotion
                dur="2.2s"
                begin={`${1.2 + i * 0.6}s`}
                repeatCount="indefinite"
              >
                <mpath href={`#vx-ai-out-${i}`} />
              </animateMotion>
            </circle>
          ))}

          {/* nodes */}
          {INPUTS.map((n) => (
            <g
              key={n.label}
              transform={`translate(18 ${n.y - 22})`}
              className="vis-ai-node"
            >
              <rect width="100" height="44" rx="8" />
              <circle cx="20" cy="22" r="5" className="vis-ai-node-dot" />
              <text x="34" y="26.5" className="vis-ai-text">
                {n.label}
              </text>
            </g>
          ))}
          {OUTPUTS.map((n) => (
            <g
              key={n.label}
              transform={`translate(522 ${n.y - 22})`}
              className="vis-ai-node"
            >
              <rect width="112" height="44" rx="8" />
              <circle
                cx="20"
                cy="22"
                r="5"
                className="vis-ai-node-dot vis-ai-node-dot--alt"
              />
              <text x="34" y="26.5" className="vis-ai-text">
                {n.label}
              </text>
            </g>
          ))}

          <g
            transform={`translate(${CORE.x} ${CORE.y})`}
            className="vis-ai-core"
          >
            <circle r="92" className="vis-ai-orbit" />
            <circle r="70" className="vis-ai-orbit vis-ai-orbit--b" />
            <circle r="46" className="vis-ai-core-body" />
            <path
              d="M0 -24 L21 -12 L21 12 L0 24 L-21 12 L-21 -12 Z"
              className="vis-ai-hex"
            />
            <text y="5" textAnchor="middle" className="vis-ai-core-text">
              AI
            </text>
          </g>
        </svg>
      </div>

      <div className="vis-layer vis-ai-log" data-depth="1.6">
        <div className="vis-console">
          <div className="vis-console-head caption">
            <span className="vis-dot pulse-dot" />
            workflow / inbound-leads
          </div>
          <ul>
            {LOG.map(([event, detail], i) => (
              <li key={event} style={{ ["--i" as string]: i }}>
                <span className="caption vis-console-event">→ {event}</span>
                <span className="caption text-muted">{detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
