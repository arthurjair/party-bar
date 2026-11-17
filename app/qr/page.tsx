// app/qr/page.tsx
// Needs: npm i qrcode && npm i -D @types/qrcode
"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

const DRINKS = ["Cosmopolitan", "Pornstar Margarita", "Velvet Berry"];

export default function QrPage() {
  const [svg, setSvg] = useState("");
  const [target, setTarget] = useState("");

  useEffect(() => {
    // Uses the address you opened this page from. Override with /qr?url=https://...
    const override = new URLSearchParams(window.location.search).get("url");
    const url = override || `${window.location.origin}/`;
    setTarget(url);
    QRCode.toString(url, {
      type: "svg",
      margin: 0,
      errorCorrectionLevel: "M",
      color: { dark: "#1d1d1f", light: "#00000000" },
    }).then(setSvg);
  }, []);

  return (
    <main className="qr">
      <style>{css}</style>

      <article className="card">
        <span className="eyebrow mono">Tonight&apos;s bar</span>

        <div className="scribble">
          <span className="num hand">
            <svg viewBox="0 0 80 50" className="circle" aria-hidden>
              <path
                d="M8 28 C6 10 62 4 72 20 C80 34 52 46 28 44 C12 42 4 32 14 18"
                fill="none"
                stroke="#1d1d1f"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            🍸
          </span>
          <span className="hand title">Order a drink</span>
        </div>

        <div className="code" dangerouslySetInnerHTML={{ __html: svg }} />

        <div className="meta">
          <div>
            <h4>MENU</h4>
            <ul className="mono">
              {DRINKS.map((d, i) => (
                <li key={d}>
                  {String(i + 1).padStart(2, "0")}. {d}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>HOW</h4>
            <ul className="mono">
              <li>[●] scan</li>
              <li>[ ] pick a drink</li>
              <li>[ ] add your name</li>
              <li>[ ] send</li>
            </ul>
          </div>
        </div>

        <p className="url mono">{target.replace(/^https?:\/\//, "")}</p>
      </article>
    </main>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Courier+Prime&family=Inter:wght@400;500;600&display=swap');

* { box-sizing: border-box; }
html, body { margin: 0; background: #14171d; }
.mono { font-family: "Courier Prime", monospace; }
.hand { font-family: Caveat, cursive; font-weight: 500; }

.qr {
  min-height: 100dvh; display: grid; place-items: center; padding: 24px;
  background:
    radial-gradient(120% 60% at 50% 105%, #e9e8e4 0%, rgba(233,232,228,0) 60%),
    linear-gradient(180deg, #0f1420 0%, #2b3345 38%, #8e939d 72%, #d9d8d4 100%);
  font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #1d1d1f;
  -webkit-print-color-adjust: exact; print-color-adjust: exact;
}

.card {
  width: min(100%, 400px); background: #efede8; padding: 22px 22px 18px;
  box-shadow: 0 24px 50px rgba(0,0,0,.3);
}
.eyebrow { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; opacity: .6; }

.scribble { display: flex; align-items: baseline; gap: 6px; margin: 8px 0 14px; transform: rotate(-3deg); }
.num { position: relative; font-size: 26px; padding: 0 14px; }
.circle { position: absolute; left: -4px; top: -6px; width: 68px; height: 44px; }
.title { font-size: 46px; line-height: 1; }

.code { aspect-ratio: 1; width: 100%; padding: 6px; }
.code svg { width: 100%; height: 100%; display: block; }

.meta { display: grid; grid-template-columns: 1.2fr 1fr; gap: 12px; margin-top: 16px; }
h4 { margin: 0 0 4px; font-size: 11px; font-weight: 600; letter-spacing: .02em; }
ul { list-style: none; margin: 0; padding: 0; font-size: 12.5px; line-height: 1.45; white-space: pre; }

.url { margin: 16px 0 0; text-align: center; font-size: 11px; opacity: .55; word-break: break-all; }

@media print {
  @page { margin: 0; }
  .qr { min-height: 100vh; }
  .card { box-shadow: none; }
}
`;
