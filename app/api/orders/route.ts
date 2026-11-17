// app/api/orders/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export type Order = {
  id: string;
  name: string;
  drink: string;
  time: string;
  done: boolean;
};

/* ───────── storage ─────────
   If UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set (needed on Vercel),
   orders are kept in Upstash Redis. Otherwise they live in memory, which is fine
   when you run the app on ONE machine (laptop / Raspberry Pi) on the party wifi. */
// Vercel's Upstash integration creates KV_REST_API_*; a manual Upstash setup uses UPSTASH_REDIS_REST_*
const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const KEY = "party-orders";

// Optional: set BAR_PIN in Vercel so only you can see / update orders on /bar
const BAR_PIN = process.env.BAR_PIN;
const unauthorized = (req: Request) => !!BAR_PIN && req.headers.get("x-bar-pin") !== BAR_PIN;
const noStorage = () => !!process.env.VERCEL && !(REDIS_URL && TOKEN);
const storageError = () =>
  NextResponse.json({ error: "No database connected. Add Upstash Redis to this Vercel project." }, { status: 500 });

const g = globalThis as unknown as { __orders?: Map<string, Order> };
const mem = (g.__orders ??= new Map<string, Order>());

async function redis(cmd: (string | number)[]) {
  const res = await fetch(REDIS_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmd),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  return (await res.json()).result;
}

async function getAll(): Promise<Order[]> {
  let list: Order[];
  if (REDIS_URL && TOKEN) {
    const flat: string[] = (await redis(["HGETALL", KEY])) ?? [];
    list = [];
    for (let i = 1; i < flat.length; i += 2) list.push(JSON.parse(flat[i]));
  } else {
    list = [...mem.values()];
  }
  return list.sort((a, b) => b.time.localeCompare(a.time));
}

async function save(o: Order) {
  if (REDIS_URL && TOKEN) await redis(["HSET", KEY, o.id, JSON.stringify(o)]);
  else mem.set(o.id, o);
}

async function remove(id: string) {
  if (REDIS_URL && TOKEN) await redis(["HDEL", KEY, id]);
  else mem.delete(id);
}

async function find(id: string): Promise<Order | null> {
  if (REDIS_URL && TOKEN) {
    const raw = await redis(["HGET", KEY, id]);
    return raw ? JSON.parse(raw) : null;
  }
  return mem.get(id) ?? null;
}

/* ───────── handlers ───────── */

// list all orders (bar page)
export async function GET(req: Request) {
  if (unauthorized(req)) return NextResponse.json({ error: "pin" }, { status: 401 });
  if (noStorage()) return storageError();
  return NextResponse.json(await getAll());
}

// new order (guest menu)
export async function POST(req: Request) {
  if (noStorage()) return storageError();
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 40);
  const drink = String(body?.drink ?? "").trim().slice(0, 60);
  if (!name || !drink) return NextResponse.json({ error: "name and drink required" }, { status: 400 });

  const order: Order = {
    id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name,
    drink,
    time: new Date().toISOString(),
    done: false,
  };
  await save(order);
  return NextResponse.json(order, { status: 201 });
}

// toggle done (bar page)
export async function PATCH(req: Request) {
  if (unauthorized(req)) return NextResponse.json({ error: "pin" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const o = body?.id ? await find(String(body.id)) : null;
  if (!o) return NextResponse.json({ error: "not found" }, { status: 404 });
  o.done = typeof body.done === "boolean" ? body.done : !o.done;
  await save(o);
  return NextResponse.json(o);
}

// delete one order (?id=...)
export async function DELETE(req: Request) {
  if (unauthorized(req)) return NextResponse.json({ error: "pin" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await remove(id);
  return NextResponse.json({ ok: true });
}
