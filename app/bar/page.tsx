// app/bar/page.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Order = { id: string; name: string; drink: string; time: string; done: boolean };

const DRINK_NO: Record<string, string> = {
  Cosmopolitan: "01",
  "Pornstar Margarita": "02",
  "Velvet Berry": "03",
};

const POLL_MS = 3000;

export default function BarPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [showDone, setShowDone] = useState(false);
  const [sound, setSound] = useState(false);
  const [offline, setOffline] = useState(false);
  const [needPin, setNeedPin] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [serverError, setServerError] = useState("");
  const known = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const pin = useRef("");

  const headers = (json = false): HeadersInit => ({
    ...(json ? { "Content-Type": "application/json" } : {}),
    "x-bar-pin": pin.current,
  });

  const ding = () => {
    const ctx = audio.current;
    if (!ctx) return;
    [880, 1320].forEach((f, i) => {
      const o = ctx.createOscillator();
      const gain = ctx.createGain();
      o.frequency.value = f;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.12 + 0.35);
      o.connect(gain).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
    navigator.vibrate?.(150);
  };

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store", headers: headers() });
      if (res.status === 401) {
        setNeedPin(true);
        return;
      }
      if (!res.ok) {
        setServerError((await res.json().catch(() => null))?.error ?? `Server error ${res.status}`);
        return;
      }
      setNeedPin(false);
      setServerError("");
      const data: Order[] = await res.json();
      const ids = new Set(data.map((o) => o.id));
      if (known.current && data.some((o) => !known.current!.has(o.id) && !o.done)) ding();
      known.current = ids;
      setOrders(data);
      setOffline(false);
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    try {
      pin.current = localStorage.getItem("bar-pin") ?? "";
    } catch {}
    load();
    const t = setInterval(load, POLL_MS);
    return () => clearInterval(t);
  }, [load]);

  const toggle = async (o: Order) => {
    setOrders((list) => list.map((x) => (x.id === o.id ? { ...x, done: !x.done } : x)));
    await fetch("/api/orders", {
      method: "PATCH",
      headers: headers(true),
      body: JSON.stringify({ id: o.id, done: !o.done }),
    });
    load();
  };

  const remove = async (o: Order) => {
    setOrders((list) => list.filter((x) => x.id !== o.id));
    await fetch(`/api/orders?id=${o.id}`, { method: "DELETE", headers: headers() });
    load();
  };

  const submitPin = () => {
    pin.current = pinInput.trim();
    try {
      localStorage.setItem("bar-pin", pin.current);
    } catch {}
    load();
  };

  if (needPin) {
    return (
      <main className="bar">
        <style>{css}</style>
        <div className="gate">
          <span className="hand">Bar only</span>
          <input
            type="password"
            inputMode="numeric"
            placeholder="PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitPin()}
            autoFocus
          />
          <button className="pick mono" onClick={submitPin}>
            [&nbsp;&nbsp;] Enter
          </button>
        </div>
      </main>
    );
  }

  const enableSound = () => {
    audio.current ??= new AudioContext();
    audio.current.resume();
    setSound(true);
    ding();
  };

  const open = orders.filter((o) => !o.done).reverse(); // oldest first = make these first
  const done = orders.filter((o) => o.done);
  const tally = open.reduce<Record<string, number>>((acc, o) => ((acc[o.drink] = (acc[o.drink] ?? 0) + 1), acc), {});
  const fmt = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <main className="bar">
      <style>{css}</style>

      <header className="top">
        <div>
          <span className="eyebrow">Behind the bar</span>
          <h1 className="hand">Orders</h1>
        </div>
        <div className="right">
          <span className={`pill ${offline ? "warn" : ""}`}>{offline ? "offline" : `${open.length} open`}</span>
          {!sound && (
            <button className="pill btn" onClick={enableSound}>
              🔔 sound on
            </button>
          )}
        </div>
      </header>

      {serverError && <p className="error mono">{serverError}</p>}

      {open.length > 0 && (
        <section className="tally mono">
          {Object.entries(tally).map(([drink, n]) => (
            <span key={drink}>
              {n}× {drink}
            </span>
          ))}
        </section>
      )}

      <section className="list">
        {open.length === 0 && (
          <div className="empty">
            <span className="hand">All quiet…</span>
            <p className="mono small">New orders show up here automatically</p>
          </div>
        )}

        {open.map((o, i) => (
          <article key={o.id} className={`ticket ${i === 0 ? "next" : ""}`}>
            <div className="head mono small">
              <span>{i === 0 ? "NEXT UP" : `#${i + 1} IN LINE`}</span>
              <span>{fmt(o.time)}</span>
            </div>
            <div className="drink">
              <span className="num hand">{DRINK_NO[o.drink] ?? "··"}.</span>
              <span className="hand dname">{o.drink}</span>
            </div>
            <p className="who mono">for {o.name}</p>
            <button className="pick mono" onClick={() => toggle(o)}>
              [&nbsp;&nbsp;] Done, served
            </button>
          </article>
        ))}
      </section>

      {done.length > 0 && (
        <section className="doneWrap">
          <button className="toggle mono small" onClick={() => setShowDone((s) => !s)}>
            {showDone ? "−" : "+"} served ({done.length})
          </button>
          {showDone &&
            done.map((o) => (
              <div key={o.id} className="doneRow mono">
                <button onClick={() => toggle(o)} title="Mark as open again">
                  [●]
                </button>
                <span className="grow">
                  {o.drink} · {o.name}
                </span>
                <span className="small">{fmt(o.time)}</span>
                <button onClick={() => remove(o)} aria-label="Delete">
                  ×
                </button>
              </div>
            ))}
        </section>
      )}
    </main>
  );
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@500;600&family=Courier+Prime&family=Inter:wght@400;500;600&display=swap');

* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body { margin: 0; background: #14171d; }

.bar {
  min-height: 100dvh; max-width: 560px; margin: 0 auto;
  padding: 0 16px calc(32px + env(safe-area-inset-bottom));
  background:
    radial-gradient(120% 60% at 50% 105%, #e9e8e4 0%, rgba(233,232,228,0) 60%),
    linear-gradient(180deg, #0f1420 0%, #2b3345 30%, #8e939d 70%, #d9d8d4 100%);
  background-attachment: fixed;
  font-family: Inter, "Helvetica Neue", Arial, sans-serif; color: #1d1d1f;
}
.mono { font-family: "Courier Prime", monospace; }
.hand { font-family: Caveat, cursive; font-weight: 500; }
.small { font-size: 12px; letter-spacing: .06em; }

.top { display: flex; justify-content: space-between; align-items: flex-end; padding: 24px 4px 14px; color: #e9e8e4; }
.eyebrow { font-family: "Courier Prime", monospace; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; opacity: .8; }
h1 { margin: 0; font-size: 52px; line-height: 1; }
.right { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
.pill { font-size: 13px; padding: 6px 12px; border-radius: 999px; background: rgba(255,255,255,.14); color: #e9e8e4; backdrop-filter: blur(8px); border: 0; }
.pill.warn { background: #a8203d; }
.pill.btn { cursor: pointer; }

.tally { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 14px; }
.tally span { background: rgba(239,237,232,.9); padding: 6px 10px; font-size: 13px; }

.list { display: flex; flex-direction: column; gap: 12px; }
.ticket { background: #efede8; padding: 14px 16px 16px; box-shadow: 0 14px 30px rgba(0,0,0,.25); animation: drop .35s ease; }
.ticket.next { box-shadow: 0 0 0 2px #1d1d1f, 0 18px 36px rgba(0,0,0,.3); }
.head { display: flex; justify-content: space-between; opacity: .6; }
.drink { display: flex; align-items: baseline; gap: 8px; margin: 4px 0 0; transform: rotate(-2deg); }
.num { font-size: 30px; }
.dname { font-size: 40px; line-height: 1.05; }
.who { font-size: 18px; margin: 4px 0 12px; }
.pick { width: 100%; font-size: 15px; background: transparent; color: #1d1d1f; border: 1px solid #1d1d1f; padding: 13px; text-align: left; white-space: pre; cursor: pointer; }
.pick:active { background: #1d1d1f; color: #efede8; }

.empty { background: rgba(239,237,232,.9); padding: 28px 16px; text-align: center; }
.empty .hand { font-size: 40px; }
.empty p { margin: 6px 0 0; opacity: .6; }

.doneWrap { margin-top: 20px; }
.toggle { background: none; border: 0; padding: 8px 4px; cursor: pointer; color: #1d1d1f; }
.doneRow { display: flex; align-items: center; gap: 10px; background: rgba(239,237,232,.75); padding: 10px 12px; margin-top: 6px; font-size: 14px; }
.doneRow .grow { flex: 1; opacity: .7; text-decoration: line-through; }
.doneRow button { background: none; border: 0; font: inherit; cursor: pointer; color: #1d1d1f; padding: 4px; }

.error { background: #a8203d; color: #fff; padding: 10px 12px; font-size: 13px; margin: 0 0 12px; }

.gate {
  min-height: 100dvh; display: flex; flex-direction: column; justify-content: center; gap: 12px;
  max-width: 320px; margin: 0 auto;
}
.gate .hand { font-size: 52px; color: #e9e8e4; text-align: center; }
.gate input { font: 16px "Courier Prime", monospace; padding: 14px; border: 1px solid #1d1d1f; background: #efede8; border-radius: 0; outline: none; text-align: center; letter-spacing: .3em; }
.gate .pick { background: #efede8; text-align: center; }

@keyframes drop { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: none; } }
`;
