/** Web Development — a layered browser composition with live code and a deploy status. */
export default function WebVisual() {
  return (
    <div className="vis vis-web" aria-hidden="true">
      <div className="vis-layer vis-web-back" data-depth="0.4">
        <div className="vis-window">
          <div className="vis-window-bar">
            <i />
            <i />
            <i />
            <span className="vis-url caption">yourbrand.com/shop</span>
          </div>
          <div className="vis-web-grid">
            {Array.from({ length: 6 }, (_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static decorative tiles
              <div key={i} className="vis-product">
                <div className="vis-product-img" data-variant={i % 3} />
                <b />
                <s />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="vis-layer vis-web-front" data-depth="1">
        <div className="vis-window vis-window--raised">
          <div className="vis-window-bar">
            <i />
            <i />
            <i />
            <span className="vis-url caption">yourbrand.com</span>
          </div>
          <div className="vis-web-hero">
            <div className="vis-web-copy">
              <span className="vis-chip caption">New collection</span>
              <b className="vis-line vis-line--xl" />
              <b className="vis-line vis-line--lg" />
              <s className="vis-line vis-line--sm" />
              <s className="vis-line vis-line--xs" />
              <span className="vis-cta" />
            </div>
            <div className="vis-web-art">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
        <svg aria-hidden="true" className="vis-pointer" viewBox="0 0 24 24">
          <path d="M4 2 L20 12 L12 13.5 L8 21 Z" />
        </svg>
      </div>

      <div className="vis-layer vis-web-code" data-depth="1.6">
        <pre className="vis-code">
          <code>
            <span className="tk-k">export default</span>{" "}
            <span className="tk-k">async function</span>{" "}
            <span className="tk-f">Store</span>() {"{"}
            {"\n"}
            {"  "}
            <span className="tk-k">const</span> products ={" "}
            <span className="tk-k">await</span>{" "}
            <span className="tk-f">getProducts</span>();
            {"\n"}
            {"  "}
            <span className="tk-k">return</span> &lt;
            <span className="tk-t">Grid</span> items={"{"}products{"}"} /&gt;;
            {"\n"}
            {"}"}
          </code>
        </pre>
      </div>

      <div className="vis-layer vis-web-status" data-depth="2">
        <span className="vis-status">
          <span className="vis-dot pulse-dot" />
          <span className="caption">Deployed · Production</span>
        </span>
      </div>
    </div>
  );
}
