import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  Bike,
  Check,
  Home,
  Plus,
  Search,
  User,
  Wallet,
} from "lucide-react";

const PAYMENTS = [
  { name: "Corner Cafe", note: "Coffee", amount: "−₹340" },
  { name: "Aanya S.", note: "Refund", amount: "+₹1,200", in: true },
  { name: "Metro card", note: "Top up", amount: "−₹500" },
  { name: "Salary", note: "Monthly", amount: "+₹62,000", in: true },
  { name: "Green Grocer", note: "Food", amount: "−₹1,180" },
];

const ORDER = ["Confirmed", "Preparing", "On the way"];

const WEEK = [52, 74, 40, 88, 66, 94, 60];

function StatusBar() {
  return (
    <div className="app-status">
      <span>9:41</span>
      <span className="app-island" />
      <span className="app-signal">
        <i />
        <i />
        <i />
      </span>
    </div>
  );
}

function Tabs({ on }: { on: number }) {
  const icons = [Home, Search, Wallet, User];
  return (
    <div className="app-tabs">
      {icons.map((Icon, i) => (
        <span key={Icon.displayName ?? i} data-on={i === on ? "" : undefined}>
          <Icon size="1.25em" strokeWidth={2} />
        </span>
      ))}
    </div>
  );
}

/** App Development: three real screens, a push and a store release. */
export default function AppVisual() {
  return (
    <div className="vis vis-app" aria-hidden="true">
      <div className="vis-layer app-phone app-phone--left" data-depth="0.6">
        <div className="app-screen">
          <StatusBar />
          <span className="ui-mute">Balance</span>
          <strong className="app-balance">₹24,580</strong>
          <svg aria-hidden="true" className="app-spark" viewBox="0 0 120 34">
            <path d="M0 26 C14 24 18 12 32 15 S52 28 66 19 86 6 100 10 112 6 120 3" />
          </svg>
          <div className="app-actions">
            <span>
              <ArrowUpRight size="1.1em" strokeWidth={2.5} />
              Send
            </span>
            <span>
              <ArrowDownLeft size="1.1em" strokeWidth={2.5} />
              Ask
            </span>
            <span>
              <Plus size="1.1em" strokeWidth={2.5} />
              Add
            </span>
          </div>
          <ul className="app-list">
            {PAYMENTS.map((pay) => (
              <li key={pay.name}>
                <i>{pay.name[0]}</i>
                <span>
                  {pay.name}
                  <small>{pay.note}</small>
                </span>
                <strong data-in={pay.in ? "" : undefined}>{pay.amount}</strong>
              </li>
            ))}
          </ul>
          <Tabs on={2} />
        </div>
      </div>

      <div className="vis-layer app-phone app-phone--center" data-depth="1.2">
        <div className="app-screen">
          <StatusBar />
          <div className="app-map">
            <svg
              aria-hidden="true"
              viewBox="0 0 200 170"
              preserveAspectRatio="xMidYMid slice"
            >
              <g className="app-roads">
                <path d="M-10 40 L210 62" />
                <path d="M-10 118 L210 96" />
                <path d="M46 -10 L66 180" />
                <path d="M150 -10 L132 180" />
              </g>
              <rect x="74" y="72" width="48" height="16" rx="3" />
              <path
                className="app-route"
                d="M28 142 L60 116 L136 104 L142 36"
              />
              <path
                className="app-route app-route--done"
                pathLength="100"
                d="M28 142 L60 116 L136 104 L142 36"
              />
              <circle cx="28" cy="142" r="5" className="app-pin" />
              <circle cx="142" cy="36" r="5" className="app-pin app-pin--end" />
              <g className="app-rider">
                <circle r="9" />
                <circle r="4" />
              </g>
            </svg>
          </div>
          <div className="app-eta">
            <div>
              <small>Arriving in</small>
              <strong>12 min</strong>
            </div>
            <span className="app-avatar">
              <Bike size="1.3em" strokeWidth={2} />
            </span>
          </div>
          <ol className="app-steps">
            {ORDER.map((step, i) => (
              <li key={step} data-now={i === 2 ? "" : undefined}>
                <i>
                  <Check size="0.8em" strokeWidth={4} />
                </i>
                {step}
              </li>
            ))}
          </ol>
          <span className="app-cta">Track order</span>
        </div>
      </div>

      <div className="vis-layer app-phone app-phone--right" data-depth="0.9">
        <div className="app-screen">
          <StatusBar />
          <span className="ui-mute">This week</span>
          <strong className="app-title">Keep it up, Aanya</strong>
          <div className="app-goal">
            <svg aria-hidden="true" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" />
              <circle
                cx="50"
                cy="50"
                r="40"
                pathLength="100"
                strokeDasharray="78 100"
              />
            </svg>
            <span>
              <strong>78%</strong>
              <small>of goal</small>
            </span>
          </div>
          <div className="app-week">
            {WEEK.map((value, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: a fixed week of bars
                key={i}
                style={{ "--v": `${value}%`, "--i": i } as React.CSSProperties}
                data-on={i === 5 ? "" : undefined}
              >
                <i />
                <small>{"MTWTFSS"[i]}</small>
              </span>
            ))}
          </div>
          <Tabs on={0} />
        </div>
      </div>

      <div className="vis-layer app-push" data-depth="2">
        <span className="app-push-icon">
          <Bell size="1.1em" strokeWidth={2.25} />
        </span>
        <div>
          <strong>Your order is 2 stops away</strong>
          <small>Rahul is nearby. Keep your phone handy.</small>
        </div>
        <small>now</small>
      </div>

      <div className="vis-layer ui-win app-release" data-depth="1.6">
        <div className="ui-head">
          <span>Release 2.4.0</span>
          <span className="ui-live">Rolling out</span>
        </div>
        <ul>
          <li>
            <span>App Store</span>
            <strong>Live</strong>
          </li>
          <li>
            <span>Google Play</span>
            <strong>60%</strong>
          </li>
          <li>
            <span>Crash free</span>
            <strong>99.9%</strong>
          </li>
        </ul>
      </div>
    </div>
  );
}
