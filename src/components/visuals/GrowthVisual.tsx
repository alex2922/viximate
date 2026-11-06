import {
  Heart,
  MessageCircle,
  Send,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

const KPIS = [
  {
    label: "Sessions",
    value: "48.2k",
    delta: "+38%",
    line: "M0 22 C12 20 18 14 30 16 S48 8 60 9 80 3 100 2",
  },
  {
    label: "Leads",
    value: "1,204",
    delta: "+22%",
    line: "M0 20 C14 22 20 12 34 14 S54 16 64 10 84 8 100 4",
  },
  {
    label: "Return on ads",
    value: "4.6×",
    delta: "+0.8",
    line: "M0 18 C16 16 22 20 36 13 S58 12 70 8 88 7 100 3",
  },
  {
    label: "Cost per lead",
    value: "₹412",
    delta: "−18%",
    down: true,
    line: "M0 4 C14 6 20 8 34 9 S54 14 68 15 86 20 100 21",
  },
];

const CHANNELS = [
  { label: "Organic search", value: 42 },
  { label: "Paid social", value: 27 },
  { label: "Email", value: 18 },
  { label: "Referral", value: 13 },
];

const FUNNEL = [
  { label: "Visits", value: "48.2k", width: 100 },
  { label: "Leads", value: "1,204", width: 66 },
  { label: "Qualified", value: "386", width: 42 },
  { label: "Won", value: "94", width: 22 },
];

const LEADS = [
  { name: "Priya, Pune", from: "Web form" },
  { name: "Kabir, Delhi", from: "Paid social" },
  { name: "Meera, Kochi", from: "Newsletter" },
];

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const REACH =
  "M0 150 C40 146 60 128 100 122 S170 112 200 96 270 92 300 70 370 58 400 44 470 30 500 12";
const SPEND = "M0 164 C60 160 110 152 160 150 S280 136 330 128 440 112 500 104";

const WEEK = [["Reel"], [], ["Post", "Mail"], [], ["Reel"], ["Ad"], []];

/** Digital Growth: one dashboard for traffic, funnel, channels and content. */
export default function GrowthVisual() {
  return (
    <div className="vis vis-growth" aria-hidden="true">
      <div className="vis-layer ui-win grow-board" data-depth="0.4">
        <div className="ui-head grow-title">
          <span>Growth overview</span>
          <span className="ui-mute">Last 6 months</span>
          <span className="ui-live">Live</span>
        </div>

        <div className="grow-kpis">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="grow-kpi">
              <span className="ui-mute">{kpi.label}</span>
              <strong>{kpi.value}</strong>
              <em>
                {kpi.down ? (
                  <TrendingDown size="1em" strokeWidth={2.5} />
                ) : (
                  <TrendingUp size="1em" strokeWidth={2.5} />
                )}
                {kpi.delta}
              </em>
              <svg
                aria-hidden="true"
                viewBox="0 0 100 24"
                preserveAspectRatio="none"
              >
                <path d={kpi.line} pathLength="100" />
              </svg>
            </div>
          ))}
        </div>

        <div className="grow-main">
          <div className="grow-chart">
            <div className="ui-head">
              <span>Audience reach</span>
              <span className="grow-key">
                <i />
                Reach
                <i data-b="" />
                Spend
              </span>
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 500 176"
              preserveAspectRatio="none"
            >
              <g className="grow-gridlines">
                <path d="M0 44 H500 M0 88 H500 M0 132 H500" />
              </g>
              <path className="grow-area" d={`${REACH} V176 H0 Z`} />
              <path className="grow-spend" d={SPEND} pathLength="100" />
              <path className="grow-reach" d={REACH} pathLength="100" />
            </svg>
            <span className="grow-tip">
              <small>Jun</small>
              <strong>+38%</strong>
            </span>
            <div className="grow-months">
              {MONTHS.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>
          </div>

          <div className="grow-side">
            <div className="ui-head">
              <span>Funnel</span>
            </div>
            <ul className="grow-funnel">
              {FUNNEL.map((step, i) => (
                <li
                  key={step.label}
                  style={
                    {
                      "--w": `${step.width}%`,
                      "--i": i,
                    } as React.CSSProperties
                  }
                >
                  <i />
                  <span>{step.label}</span>
                  <strong>{step.value}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="grow-foot">
          <ul className="grow-channels">
            {CHANNELS.map((channel, i) => (
              <li
                key={channel.label}
                style={
                  {
                    "--w": `${channel.value}%`,
                    "--i": i,
                  } as React.CSSProperties
                }
              >
                <span>{channel.label}</span>
                <i />
                <strong>{channel.value}%</strong>
              </li>
            ))}
          </ul>
          <div className="grow-week">
            {WEEK.map((posts, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: a fixed week
              <div key={i}>
                <small>{"MTWTFSS"[i]}</small>
                {posts.map((post) => (
                  <span key={post} data-kind={post}>
                    {post}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vis-layer ui-win grow-post" data-depth="1.8">
        <div className="grow-post-art">
          <span />
          <span />
        </div>
        <div className="grow-post-row">
          <span>
            <Heart size="1.05em" strokeWidth={2.5} />
            <b>2.4k</b>
          </span>
          <span>
            <MessageCircle size="1.05em" strokeWidth={2.5} />
            186
          </span>
          <span>
            <Send size="1.05em" strokeWidth={2.5} />
            91
          </span>
        </div>
        <span className="ui-live">Campaign live</span>
      </div>

      <div className="vis-layer ui-win grow-feed" data-depth="1.2">
        <div className="ui-head">
          <span>New leads</span>
          <span className="ui-mute">Today</span>
        </div>
        <ul>
          {LEADS.map((lead, i) => (
            <li key={lead.name} style={{ "--i": i } as React.CSSProperties}>
              <i>{lead.name[0]}</i>
              <span>
                {lead.name}
                <small>{lead.from}</small>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
