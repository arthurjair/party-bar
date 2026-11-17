"use client";

import { useEffect, useRef, useState } from "react";

/* ───────────────── CONFIG ───────────────── */
// Orders are sent here and show up on /bar
const ORDER_ENDPOINT = "/api/orders";

const PARTY_TITLE = "Tonight's bar";

/* ───────────────── DATA ───────────────── */
type Drink = {
  id: string;
  name: string;
  color: string;
  description: string;
  ingredients: string[];
  note: string; // handwritten scribble on the card
  photo?: string; // optional: put a real photo in /public and set e.g. "/drinks/velvet.jpg"
  art: "cosmo" | "pornstar" | "velvet";
};

const DRINKS: Drink[] = [
  {
    id: "cosmo",
    name: "Cosmopolitan",
    color: "Blush cranberry red",
    note: "Cosmopolitan",
    description:
      "A crisp, bright classic. Vodka and Cointreau meet tart cranberry and fresh lime, served ice cold in a martini glass. Sharp, clean and dangerously easy to drink.",
    ingredients: ["vodka", "cointreau", "cranberry juice", "fresh lime juice"],
    art: "cosmo",
  },
  {
    id: "pornstar",
    name: "Pornstar Margarita",
    color: "Golden passion fruit",
    note: "Pornstar",
    description:
      "Tropical with a tequila kick. Passion fruit and a touch of vanilla shaken with fresh lime, served in a stemmed glass and crowned with half a passion fruit.",
    ingredients: ["tequila", "passion fruit liqueur", "passion fruit purée", "fresh lime juice", "vanilla syrup"],
    art: "pornstar",
  },
  {
    id: "velvet",
    name: "Velvet Berry",
    color: "Pale berry pink",
    note: "Velvet Berry",
    description:
      "A delicate cocktail with a subtle berry acidity and a soft vanilla finish. Pale pink, fresh blackberry and clear ice. Not overly sweet: fresh, smooth and easy going.",
    ingredients: ["gin", "blackberry liqueur", "fresh lemon juice", "vanilla syrup", "ice"],
    art: "velvet",
  },
];

/* ───────────────── DRINK ILLUSTRATIONS ───────────────── */
// round SVG coords so server + browser render identical numbers (avoids hydration errors)
const r2 = (n: number) => Math.round(n * 100) / 100;

function Pick({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9ccd2" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx={x2} cy={y2} r="4.2" fill="url(#metal)" />
    </g>
  );
}

function DrinkArt({ kind }: { kind: Drink["art"] }) {
  return (
    <svg viewBox="0 0 200 230" className="art" aria-hidden>
      <defs>
        <linearGradient id="glass" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".08" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".05" />
          <stop offset="1" stopColor="#fff" stopOpacity=".45" />
        </linearGradient>
        <radialGradient id="metal" cx=".35" cy=".35">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#8a8f98" />
        </radialGradient>
        <linearGradient id="cosmoL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e2566f" />
          <stop offset="1" stopColor="#a8203d" />
        </linearGradient>
        <linearGradient id="pornL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d27a" />
          <stop offset="1" stopColor="#d99a2b" />
        </linearGradient>
        <linearGradient id="velvetL" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9d3e2" />
          <stop offset="1" stopColor="#c9a4bd" />
        </linearGradient>
        <radialGradient id="shadow">
          <stop offset="0" stopColor="#000" stopOpacity=".28" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="100" cy="205" rx="70" ry="9" fill="url(#shadow)" />

      {kind === "cosmo" && (
        <g>
          {/* martini glass: stem + base */}
          <rect x="97.8" y="128" width="4.4" height="70" fill="#fff" opacity=".45" />
          <ellipse cx="100" cy="199" rx="34" ry="6" fill="#fff" opacity=".35" stroke="#fff" strokeOpacity=".7" />
          {/* liquid (V shape) */}
          <path d="M48.6 70 L100 130 L151.4 70 Z" fill="url(#cosmoL)" />
          <ellipse cx="100" cy="70" rx="51.4" ry="4.5" fill="#ef7d90" />
          {/* cone */}
          <path d="M40 60 L100 131 L160 60" fill="url(#glass)" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" strokeLinejoin="round" />
          <ellipse cx="100" cy="60" rx="60" ry="6.5" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.2" />
          {/* lime wheel on the rim */}
          <circle cx="150" cy="56" r="11" fill="#7fae3a" />
          <circle cx="150" cy="56" r="8.6" fill="#d7ea9c" />
          {[0, 1, 2, 3, 4, 5].map((k) => {
            const a = (k / 6) * Math.PI * 2;
            return <line key={k} x1="150" y1="56" x2={r2(150 + Math.cos(a) * 8.6)} y2={r2(56 + Math.sin(a) * 8.6)} stroke="#eef6cf" strokeWidth="1" />;
          })}
          <Pick x1={66} y1={92} x2={168} y2={40} />
        </g>
      )}

      {kind === "pornstar" && (
        <g>
          {/* wine glass: stem + base */}
          <rect x="97.8" y="146" width="4.4" height="52" fill="#fff" opacity=".45" />
          <ellipse cx="100" cy="199" rx="32" ry="6" fill="#fff" opacity=".35" stroke="#fff" strokeOpacity=".7" />
          {/* liquid */}
          <path d="M59 96 C60 126 72 141 100 144 C128 141 140 126 141 96 Z" fill="url(#pornL)" />
          <ellipse cx="100" cy="96" rx="41" ry="4.5" fill="#fbe3a2" />
          {/* passion fruit half floating */}
          <ellipse cx="106" cy="93" rx="17" ry="6.5" fill="#5b2a46" />
          <ellipse cx="106" cy="92" rx="14" ry="5" fill="#f2b632" />
          {[...Array(9)].map((_, i) => (
            <circle key={i} cx={96 + (i % 5) * 4.5} cy={90.5 + Math.floor(i / 5) * 3} r="1.1" fill="#2a1a12" />
          ))}
          {/* bowl */}
          <path
            d="M64 52 C54 96 60 140 100 147 C140 140 146 96 136 52"
            fill="url(#glass)"
            stroke="#fff"
            strokeOpacity=".8"
            strokeWidth="1.2"
          />
          <ellipse cx="100" cy="52" rx="36" ry="5" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.2" />
        </g>
      )}

      {kind === "velvet" && (
        <g>
          {/* liquid */}
          <path d="M57 108 L62 186 Q100 194 138 186 L143 108 Z" fill="url(#velvetL)" opacity=".95" />
          {/* ice */}
          <rect x="66" y="92" width="34" height="32" rx="6" fill="#fff" opacity=".35" transform="rotate(-8 83 108)" />
          <rect x="98" y="100" width="30" height="28" rx="6" fill="#fff" opacity=".3" transform="rotate(10 113 114)" />
          {/* glass */}
          <path d="M52 86 L59 190 Q100 200 141 190 L148 86" fill="url(#glass)" stroke="#fff" strokeOpacity=".85" strokeWidth="1.2" />
          <ellipse cx="100" cy="86" rx="48" ry="6" fill="none" stroke="#fff" strokeOpacity=".9" strokeWidth="1.2" />
          <path d="M60 182 Q100 192 140 182 L141 190 Q100 200 59 190 Z" fill="#fff" opacity=".35" />
          {/* blackberry on pick */}
          <Pick x1={62} y1={104} x2={168} y2={70} />
          {[...Array(14)].map((_, i) => {
            const a = (i / 14) * Math.PI * 2;
            const r = i % 2 ? 7 : 4;
            return <circle key={i} cx={r2(124 + Math.cos(a) * r)} cy={r2(84 + Math.sin(a) * r * 1.1)} r="4" fill="#1b1520" stroke="#3a2c40" strokeWidth=".6" />;
          })}
          <circle cx="124" cy="84" r="4" fill="#1b1520" />
        </g>
      )}
    </svg>
  );
}

/* ───────────────── PAGE ───────────────── */
export default function DrinksMenu() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const onScroll = () => {
      const card = el.firstElementChild as HTMLElement | null;
      if (!card) return;
      const step = card.offsetWidth + 14;
      setActive(Math.round(el.scrollLeft / step));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (i: number) => {
    const el = trackRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2, behavior: "smooth" });
  };

  const drink = DRINKS.find((d) => d.id === selected) ?? null;
  const drinkNo = drink ? String(DRINKS.indexOf(drink) + 1).padStart(2, "0") : "";
  const canSend = !!drink && name.trim().length > 0 && status !== "sending";

  const send = async () => {
    if (!drink || !canSend) return;
    const guest = name.trim();
    setStatus("sending");
    try {
      const res = await fetch(ORDER_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: guest, drink: drink.name }),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const reset = () => {
    setSelected(null);
    setStatus("idle");
  };

  return (
    <main className="menu">
      <style>{css}</style>

      <header className="top">
        <span className="eyebrow">{PARTY_TITLE}</span>
        <span className="count">
          {active + 1}/{DRINKS.length}
        </span>
      </header>

      <div className="track" ref={trackRef}>
        {DRINKS.map((d, i) => {
          const isSel = selected === d.id;
          return (
            <article key={d.id} className={`card ${isSel ? "sel" : ""}`} onClick={() => goTo(i)}>
              <div className="photo">
                {d.photo ? <img src={d.photo} alt={d.name} /> : <DrinkArt kind={d.art} />}
              </div>

              <div className="scribble">
                <span className="num">
                  <svg viewBox="0 0 80 50" className="circle" aria-hidden>
                    <path
                      d="M8 28 C6 10 62 4 72 20 C80 34 52 46 28 44 C12 42 4 32 14 18"
                      fill="none"
                      stroke="#1d1d1f"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  {String(i + 1).padStart(2, "0")}.
                </span>
                <span className="hand">{d.note}</span>
              </div>

              <div className="meta">
                <div>
                  <h4>NAME</h4>
                  <p>{d.name}</p>
                </div>
                <div>
                  <h4>COLOR</h4>
                  <p>{d.color}</p>
                </div>
              </div>

              <p className="desc">{d.description}</p>

              <ul className="ing">
                {d.ingredients.map((x) => (
                  <li key={x}>- {x}</li>
                ))}
              </ul>

              <button
                className="pick"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(isSel ? null : d.id);
                  goTo(i);
                }}
              >
                [{isSel ? "●" : "  "}] {isSel ? "Selected" : "I'll have this one"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="dots">
        {DRINKS.map((d, i) => (
          <button key={d.id} className={i === active ? "on" : ""} onClick={() => goTo(i)} aria-label={d.name} />
        ))}
      </div>

      <footer className={`order ${drink ? "open" : ""}`}>
        <div className="line">
          <span className="mono">{drink ? `${drinkNo}. ${drink.name}` : "Swipe & pick a drink"}</span>
        </div>
        <div className="row">
          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            autoComplete="given-name"
            enterKeyHint="send"
          />
          <button className="send" disabled={!canSend} onClick={send}>
            {status === "sending" ? "…" : "Send →"}
          </button>
        </div>
        {status === "error" && <p className="err">Couldn't send. Try again or just ask at the bar.</p>}
      </footer>

      {status === "sent" && drink && (
        <div className="done" onClick={reset}>
          <div className="ticket" onClick={(e) => e.stopPropagation()}>
            <span className="hand big">Cheers!</span>
            <p className="mono small">ORDER RECEIVED</p>
            <p className="mono">
              {drinkNo}. {drink.name}
              <br />
              for {name.trim()}
            </p>
            <p className="mono small">Your drink is on its way</p>
            <button className="pick close" onClick={reset}>
              Close
            </button>
            <button
              className="again mono"
              onClick={() => {
                reset();
                goTo(0);
              }}
            >
              + order another
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

/* ───────────────── STYLES ───────────────── */
const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Courier+Prime&family=Inter:wght@400;500;600&display=swap');

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; background: #14171d; }

.menu {
  min-height: 100dvh;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(120% 60% at 50% 105%, #e9e8e4 0%, rgba(233,232,228,0) 60%),
    linear-gradient(180deg, #0f1420 0%, #2b3345 38%, #8e939d 72%, #d9d8d4 100%);
  font-family: Inter, "Helvetica Neue", Arial, sans-serif;
  color: #1d1d1f;
  overflow: hidden;
  padding-bottom: 150px;
}

.top {
  display: flex; justify-content: space-between; align-items: center;
  padding: 22px 22px 14px;
  color: #e9e8e4;
}
.eyebrow { font-family: "Courier Prime", monospace; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .85; }
.count {
  font-size: 13px; padding: 6px 12px; border-radius: 999px;
  background: rgba(255,255,255,.12); backdrop-filter: blur(8px);
}

.track {
  display: flex; gap: 14px;
  overflow-x: auto; scroll-snap-type: x mandatory;
  padding: 4px 7vw 10px;
  scrollbar-width: none;
}
.track::-webkit-scrollbar { display: none; }

.card {
  flex: 0 0 min(86vw, 412px);
  scroll-snap-align: center;
  background: #efede8;
  padding: 14px 14px 18px;
  box-shadow: 0 20px 40px rgba(0,0,0,.28);
  transition: transform .3s ease, box-shadow .3s ease;
}
.card.sel { box-shadow: 0 0 0 2px #1d1d1f, 0 20px 40px rgba(0,0,0,.3); }

.photo {
  aspect-ratio: 1 / .95;
  background: linear-gradient(180deg, #1a2438 0%, #4b556a 40%, #b9bcc3 78%, #dedcd8 100%);
  display: grid; place-items: center;
  overflow: hidden;
}
.photo img { width: 100%; height: 100%; object-fit: cover; }
.art { width: 78%; height: auto; margin-top: 8%; }

.scribble {
  display: flex; align-items: baseline; gap: 6px;
  margin: -26px 0 6px 6px;
  transform: rotate(-4deg);
  position: relative;
}
.num {
  position: relative; font-family: Caveat, cursive; font-size: 30px; padding: 0 12px;
}
.circle { position: absolute; left: -6px; top: -4px; width: 72px; height: 46px; }
.hand { font-family: Caveat, cursive; font-size: 40px; line-height: 1; font-weight: 500; }
.hand.big { font-size: 56px; }

.meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px; }
h4 { margin: 10px 0 2px; font-size: 11px; font-weight: 600; letter-spacing: .02em; }
.meta p { margin: 0; font-size: 13px; }

.desc { font-size: 13px; line-height: 1.45; margin: 12px 0 10px; }

.ing { list-style: none; padding: 0; margin: 0 0 14px; font-family: "Courier Prime", monospace; font-size: 12.5px; line-height: 1.35; }

.pick {
  width: 100%;
  font-family: "Courier Prime", monospace; font-size: 14px;
  background: transparent; color: #1d1d1f;
  border: 1px solid #1d1d1f; padding: 12px; text-align: left;
  white-space: pre; cursor: pointer;
}
.card.sel .pick { background: #1d1d1f; color: #efede8; }

.dots { display: flex; justify-content: center; gap: 8px; padding: 12px 0; }
.dots button { width: 7px; height: 7px; border-radius: 99px; border: 0; padding: 0; background: rgba(29,29,31,.3); transition: width .25s; }
.dots button.on { width: 22px; background: #1d1d1f; }

.order {
  position: fixed; left: 50%; bottom: 0; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  padding: 14px 16px calc(16px + env(safe-area-inset-bottom));
  background: rgba(239,237,232,.92); backdrop-filter: blur(14px);
  border-top: 1px solid rgba(0,0,0,.08);
}
.line { margin-bottom: 10px; font-size: 13px; opacity: .55; transition: opacity .2s; }
.order.open .line { opacity: 1; }
.mono { font-family: "Courier Prime", monospace; }
.small { font-size: 12px; letter-spacing: .08em; opacity: .7; }
.row { display: flex; gap: 8px; }
.row input {
  flex: 1; min-width: 0;
  font: 16px Inter, sans-serif; /* 16px stops iOS zoom */
  padding: 13px 14px; border: 1px solid #1d1d1f; background: #fff; border-radius: 0; outline: none;
}
.send {
  font: 600 15px Inter, sans-serif; padding: 0 20px; border: 0;
  background: #1d1d1f; color: #efede8; cursor: pointer;
}
.send:disabled { opacity: .3; }
.err { font-size: 12px; color: #a8203d; margin: 8px 0 0; }

.done {
  position: fixed; inset: 0; display: grid; place-items: center; padding: 24px;
  background: rgba(15,20,32,.55); backdrop-filter: blur(6px);
  animation: fade .3s ease;
}
.ticket {
  width: 100%; max-width: 340px; background: #efede8; padding: 26px 22px; text-align: center;
  box-shadow: 0 30px 60px rgba(0,0,0,.35); transform: rotate(-1.5deg);
}
.ticket p { margin: 10px 0; }
.ticket .pick { margin-top: 12px; text-align: center; }
.ticket .close { background: #1d1d1f; color: #efede8; }
.again {
  display: block; margin: 10px auto 0; padding: 6px 10px;
  background: none; border: 0; color: #1d1d1f; cursor: pointer;
  font-size: 12px; letter-spacing: .04em; text-decoration: underline; text-underline-offset: 3px; opacity: .7;
}
@keyframes fade { from { opacity: 0 } to { opacity: 1 } }
`;