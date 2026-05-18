import { NextResponse } from "next/server";

/**
 * POST /api/dispatcher/sync-wabas
 *
 * Invoca Edge Function `dispatcher-sync-wabas` no Supabase.
 * Refaz o pull de WABAs do Meta Business Manager pra disparador.contas.
 * Body opcional: { business_id?: string }
 */
export async function POST(req: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return NextResponse.json({ error: "Supabase nao configurado" }, { status: 500 });
  }

  let body: { business_id?: string } = {};
  try { body = await req.json(); } catch { /* ok */ }

  const res = await fetch(`${url}/functions/v1/dispatcher-sync-wabas`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
