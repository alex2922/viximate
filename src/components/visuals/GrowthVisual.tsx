const AREA =
  "M0 150 C 40 140, 60 128, 90 120 S 150 118, 180 96 S 240 82, 270 64 S 330 38, 360 22 L 360 170 L 0 170 Z";
const LINE =
  "M0 150 C 40 140, 60 128, 90 120 S 150 118, 180 96 S 240 82, 270 64 S 330 38, 360 22";
const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const SCHEDULE = [1, 0, 2, 1, 0, 2, 1];

/** Digital Growth — a campaign composition: content, schedule and a rising trend. */
export default function GrowthVisual() {
  return (
    <div className="vis vis-growth" aria-hidden="true">
      <div className="vis-layer vis-growth-chart" data-depth="0.6">
        <div className="vis-card">
          <div className="vis-card-head">
            <span className="caption">Audience growth</span>
            <span className="vis-legend">
              <span className="caption">
                <i className="vis-key" /> Reach
              </span>
              <span className="caption">
                <i className="vis-key vis-key--alt" /> Engagement
              </span>
            </span>
          </div>
          <svg aria-hidden="true" viewBox="0 0 360 170" className="vis-chart">
            {[40, 80, 120].map((y) => (
              <line
                key={y}
                x1="0"
                x2="360"
                y1={y}
                y2={y}
                className="vis-chart-grid"
              />
            ))}
            <path d={AREA} className="vis-chart-area" />
            <path
              d="M0 160 C 60 150, 120 140, 180 126 S 300 96, 360 80"
              className="vis-chart-line vis-chart-line--alt"
              pathLength={1}
            />
            <path d={LINE} className="vis-chart-line" pathLength={1} />
            <circle cx="360" cy="22" r="5" className="vis-chart-dot" />
          </svg>
          <div className="vis-axis caption">
            {["W1", "W2", "W3", "W4", "W5", "W6"].map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="vis-layer vis-growth-post" data-depth="1.3">
        <div className="vis-card vis-card--tight">
          <div className="vis-post-head">
            <span className="vis-avatar" />
            <div>
              <b className="vis-line vis-line--sm" />
              <s className="vis-line vis-line--xs" />
            </div>
          </div>
          <div className="vis-post-art">
            <span />
            <span />
            <span />
          </div>
          <div className="vis-post-actions">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="vis-icon vis-icon--fill"
            >
              <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="vis-icon">
              <path d="M4 5h16v11H8l-4 4z" />
            </svg>
            <svg aria-hidden="true" viewBox="0 0 24 24" className="vis-icon">
              <path d="M4 12l16-8-6 16-3-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="vis-layer vis-growth-reel" data-depth="1.8">
        <div className="vis-reel">
          <div className="vis-reel-progress">
            <i />
            <i />
            <i />
          </div>
          <div className="vis-reel-art" />
          <b className="vis-line vis-line--sm" />
          <s className="vis-line vis-line--xs" />
        </div>
      </div>

      <div className="vis-layer vis-growth-calendar" data-depth="1">
        <div className="vis-card vis-card--tight">
          <span className="caption text-muted">Content calendar</span>
          <div className="vis-calendar">
            {DAYS.map((d, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: weekday letters repeat
              <div key={i} className="vis-day">
                <span className="caption text-muted">{d}</span>
                <i data-slot={SCHEDULE[i]} />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vis-layer vis-growth-live" data-depth="2.2">
        <span className="vis-status">
          <span className="vis-dot pulse-dot" />
          <span className="caption">Campaign live</span>
        </span>
      </div>
    </div>
  );
}
