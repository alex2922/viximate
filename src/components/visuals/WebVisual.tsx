import { Check, Lock, ShoppingBag } from "lucide-react";

const PRODUCTS = [
  { name: "Linen overshirt", price: "₹3,490", art: "arch" },
  { name: "Canvas tote", price: "₹1,290", art: "disc" },
  { name: "Field jacket", price: "₹6,950", art: "bars" },
  { name: "Wool beanie", price: "₹890", art: "dome" },
];

const SCORES = [
  { label: "Performance", value: 99 },
  { label: "Accessibility", value: 100 },
  { label: "Best practices", value: 100 },
  { label: "SEO", value: 100 },
];

const STEPS = [
  { label: "Install", time: "6s" },
  { label: "Type check", time: "9s" },
  { label: "128 tests", time: "21s" },
  { label: "Build", time: "14s" },
];

/** Web Development: a live storefront, its code, its scores and its deploy. */
export default function WebVisual() {
  return (
    <div className="vis vis-web" aria-hidden="true">
      <div className="vis-layer ui-win web-browser" data-depth="0.4">
        <div className="ui-bar">
          <span className="ui-lights">
            <i />
            <i />
            <i />
          </span>
          <span className="web-url">
            <Lock size="0.8em" strokeWidth={2.5} />
            yourbrand.com/new-season
          </span>
          <span className="ui-live">Live</span>
        </div>

        <div className="web-page">
          <div className="web-nav">
            <strong>yourbrand</strong>
            <span>Shop</span>
            <span>Stories</span>
            <span>About</span>
            <span className="web-cart">
              <ShoppingBag size="1.15em" strokeWidth={2} />
              <em>
                <b>2</b>
                <b>3</b>
              </em>
            </span>
          </div>

          <div className="web-hero">
            <div>
              <span className="ui-tag">New season</span>
              <p className="web-headline">Made to last, built to sell.</p>
              <span className="web-buy">Shop the drop</span>
            </div>
            <div className="web-art">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="web-grid">
            {PRODUCTS.map((product) => (
              <div key={product.name} className="web-card">
                <div className="web-card-img" data-art={product.art}>
                  <span />
                </div>
                <div className="web-card-row">
                  <span>{product.name}</span>
                  <strong>{product.price}</strong>
                </div>
                <span className="web-add">Add to cart</span>
              </div>
            ))}
          </div>
        </div>

        <svg aria-hidden="true" className="web-pointer" viewBox="0 0 24 24">
          <path d="M4 2 L20 12 L12 13.5 L8 21 Z" />
        </svg>
      </div>

      <div className="vis-layer ui-win web-scores" data-depth="1.1">
        <div className="ui-head">
          <span>Lighthouse</span>
          <span className="ui-mute">Mobile</span>
        </div>
        <div className="web-rings">
          {SCORES.map((score) => (
            <div key={score.label} className="web-ring">
              <svg aria-hidden="true" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="16" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  pathLength="100"
                  strokeDasharray={`${score.value} 100`}
                />
              </svg>
              <strong>{score.value}</strong>
              <span>{score.label}</span>
            </div>
          ))}
        </div>
        <div className="web-vitals">
          <span>
            LCP <strong>0.9s</strong>
          </span>
          <span>
            INP <strong>64ms</strong>
          </span>
          <span>
            CLS <strong>0.01</strong>
          </span>
        </div>
      </div>

      <div className="vis-layer ui-win web-code" data-depth="1.6">
        <div className="ui-tabs">
          <span data-on="">page.tsx</span>
          <span>products.ts</span>
        </div>
        <pre>
          <code>
            <span>
              <i>1</i>
              <span className="tk-k">export default async function</span>{" "}
              <span className="tk-f">Store</span>() {"{"}
            </span>
            <span>
              <i>2</i> <span className="tk-k">const</span> items ={" "}
              <span className="tk-k">await</span>{" "}
              <span className="tk-f">getProducts</span>();
            </span>
            <span>
              <i>3</i> <span className="tk-k">return</span> (
            </span>
            <span>
              <i>4</i> {"  "}&lt;<span className="tk-t">Grid</span>{" "}
              <span className="tk-a">items</span>={"{"}items{"}"}{" "}
              <span className="tk-a">priority</span> /&gt;
            </span>
            <span>
              <i>5</i> );
            </span>
            <span>
              <i>6</i> {"}"}
              <u />
            </span>
          </code>
        </pre>
      </div>

      <div className="vis-layer ui-win web-deploy" data-depth="2">
        <div className="ui-head">
          <span>Deploy #482</span>
          <span className="ui-live">Ready</span>
        </div>
        <ul>
          {STEPS.map((step, i) => (
            <li key={step.label} style={{ "--i": i } as React.CSSProperties}>
              <Check size="1em" strokeWidth={3} />
              <span>{step.label}</span>
              <span className="ui-mute">{step.time}</span>
            </li>
          ))}
        </ul>
        <span className="ui-meter">
          <span />
        </span>
      </div>
    </div>
  );
}
