export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Ambil URL Ngrok dari Environment Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    // 1. Cek sesi kasir
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Minta data status toko & summary hari ini ke FastAPI
    const response = await fetch(`${API_URL}/api/settlement`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || 'Gagal mengambil data settlement' }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching settlement data via proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    // 1. Cek sesi kasir
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Tangkap aksi dari tombol frontend (misal: { action: 'open' } atau { action: 'close' })
    const body = await request.json();

    // 2. Lempar perintah buka/tutup kasir ke FastAPI
    const response = await fetch(`${API_URL}/api/settlement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || 'Gagal melakukan aksi settlement' }, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('Error processing settlement action via proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}