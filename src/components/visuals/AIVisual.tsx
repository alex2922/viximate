import {
  Bell,
  Check,
  ClipboardList,
  Database,
  FileText,
  Mail,
  PenLine,
  Sparkles,
  Table,
} from "lucide-react";

const IN = [
  { icon: Mail, label: "New email", note: "support@", y: 18 },
  { icon: ClipboardList, label: "Form lead", note: "website", y: 40 },
  { icon: FileText, label: "Invoice PDF", note: "accounts@", y: 62 },
];

const OUT = [
  { icon: Database, label: "Update CRM", note: "contact, deal", y: 13 },
  { icon: PenLine, label: "Draft reply", note: "for review", y: 31 },
  { icon: Bell, label: "Notify team", note: "#sales", y: 49 },
  { icon: Table, label: "Post to ledger", note: "matched", y: 67 },
];

/** Wires run from each card's edge into the agent, on a 1200 by 800 stage. */
const CORE = { x: 600, y: 320 };
const wireIn = (y: number) =>
  `M212 ${y * 8} C 360 ${y * 8} 400 ${CORE.y} ${CORE.x - 70} ${CORE.y}`;
const wireOut = (y: number) =>
  `M${CORE.x + 70} ${CORE.y} C 800 ${CORE.y} 830 ${y * 8} 958 ${y * 8}`;

const TRACE = [
  { text: "Reading invoice INV-2041", tag: "read" },
  { text: "Extracted 14 fields, 98% confidence", tag: "parse" },
  { text: "Matched to purchase order PO-8841", tag: "match" },
  { text: "Total agrees, no human needed", tag: "check" },
  { text: "Posted to ledger in 3.2s", tag: "done" },
];

const WEEK = [
  { value: "1,284", label: "Tasks run" },
  { value: "46h", label: "Hours saved" },
  { value: "12", label: "Sent for review" },
];

/** Automation and AI: a live workflow, the agent's trace and the week's tally. */
export default function AIVisual() {
  const wires = [
    ...IN.map((node) => wireIn(node.y + 5)),
    ...OUT.map((node) => wireOut(node.y + 5)),
  ];
  return (
    <div className="vis vis-ai" aria-hidden="true">
      <div className="ai-dots" />

      <svg aria-hidden="true" className="ai-wires" viewBox="0 0 1200 800">
        {wires.map((d, i) => (
          <g key={d}>
            <path d={d} />
            <circle
              r="5"
              style={
                {
                  offsetPath: `path("${d}")`,
                  "--i": i,
                } as React.CSSProperties
              }
              data-out={i >= IN.length ? "" : undefined}
            />
          </g>
        ))}
      </svg>

      {IN.map(({ icon: Icon, label, note, y }) => (
        <div
          key={label}
          className="vis-layer ai-node ai-node--in"
          data-depth="0.6"
          style={{ top: `${y}%` }}
        >
          <i>
            <Icon size="1.2em" strokeWidth={2} />
          </i>
          <span>
            {label}
            <small>{note}</small>
          </span>
        </div>
      ))}

      {OUT.map(({ icon: Icon, label, note, y }) => (
        <div
          key={label}
          className="vis-layer ai-node ai-node--out"
          data-depth="0.6"
          style={{ top: `${y}%` }}
        >
          <i>
            <Icon size="1.2em" strokeWidth={2} />
          </i>
          <span>
            {label}
            <small>{note}</small>
          </span>
          <b>
            <Check size="0.8em" strokeWidth={4} />
          </b>
        </div>
      ))}

      <div className="vis-layer ai-core" data-depth="1.2">
        <span className="ai-orbit" />
        <span className="ai-orbit ai-orbit--2" />
        <span className="ai-heart">
          <Sparkles size="2.2em" strokeWidth={1.75} />
        </span>
        <span className="ai-core-label">
          Agent
          <small>Reasoning</small>
        </span>
      </div>

      <div className="vis-layer ui-win ai-trace" data-depth="1.6">
        <div className="ui-head">
          <span>Run #20417</span>
          <span className="ui-live">Running</span>
        </div>
        <ol>
          {TRACE.map((line, i) => (
            <li key={line.tag} style={{ "--i": i } as React.CSSProperties}>
              <code>{line.tag}</code>
              {line.text}
            </li>
          ))}
        </ol>
      </div>

      <div className="vis-layer ui-win ai-week" data-depth="2">
        <div className="ui-head">
          <span>This week</span>
        </div>
        {WEEK.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
