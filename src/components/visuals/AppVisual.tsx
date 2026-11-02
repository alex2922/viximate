/** App Development — three floating devices with distinct product screens. */
export default function AppVisual() {
  return (
    <div className="vis vis-app" aria-hidden="true">
      <div className="vis-app-stage">
        <div className="vis-layer vis-phone vis-phone--left" data-depth="0.6">
          <div className="vis-phone-screen">
            <div className="vis-phone-notch" />
            <div className="vis-onboard-art">
              <span />
              <span />
            </div>
            <b className="vis-line vis-line--lg" />
            <s className="vis-line vis-line--sm" />
            <div className="vis-dots">
              <i />
              <i />
              <i />
            </div>
            <span className="vis-cta vis-cta--full" />
          </div>
        </div>

        <div className="vis-layer vis-phone vis-phone--center" data-depth="1.2">
          <div className="vis-phone-screen">
            <div className="vis-phone-notch" />
            <div className="vis-app-head">
              <s className="vis-line vis-line--xs" />
              <b className="vis-line vis-line--md" />
            </div>
            <div className="vis-ring">
              <svg aria-hidden="true" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" className="vis-ring-track" />
                <circle cx="50" cy="50" r="40" className="vis-ring-value" />
              </svg>
              <span className="caption">Weekly goal</span>
            </div>
            <div className="vis-app-cards">
              <span />
              <span />
            </div>
            <div className="vis-tabbar">
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
        </div>

        <div className="vis-layer vis-phone vis-phone--right" data-depth="0.9">
          <div className="vis-phone-screen">
            <div className="vis-phone-notch" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="vis-list-item">
                <span className="vis-thumb" data-variant={i} />
                <div>
                  <b className="vis-line vis-line--md" />
                  <s className="vis-line vis-line--xs" />
                </div>
              </div>
            ))}
            <div className="vis-total">
              <s className="vis-line vis-line--xs" />
              <b className="vis-line vis-line--sm" />
            </div>
            <span className="vis-cta vis-cta--full" />
          </div>
        </div>

        <div className="vis-layer vis-toast" data-depth="2">
          <span className="vis-dot" />
          <div>
            <span className="caption">Order confirmed</span>
            <s className="vis-line vis-line--sm" />
          </div>
        </div>

        <div className="vis-layer vis-platforms" data-depth="1.6">
          <span className="vis-chip caption">iOS</span>
          <span className="vis-chip caption">Android</span>
          <span className="vis-chip caption">Cross-platform</span>
        </div>
      </div>
    </div>
  );
}
