import { NextRequest, NextResponse } from 'next/server';

const GAS_URL = process.env.GAS_API_URL || '';

function gasError(msg: string, status = 500) {
  return NextResponse.json({ success: false, error: msg }, { status });
}

export async function GET(req: NextRequest) {
  if (!GAS_URL) return gasError('GAS_API_URL 環境變數未設定', 503);

  const { searchParams } = req.nextUrl;
  const url = new URL(GAS_URL);
  url.searchParams.set('action', 'list');
  const q = searchParams.get('q') ?? '';
  if (q) url.searchParams.set('q', q);

  try {
    const res = await fetch(url.toString(), { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return gasError('無法連接 GAS 後端');
  }
}

export async function POST(req: NextRequest) {
  if (!GAS_URL) return gasError('GAS_API_URL 環境變數未設定', 503);

  try {
    const body = await req.json();
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return gasError('無法連接 GAS 後端');
  }
}
