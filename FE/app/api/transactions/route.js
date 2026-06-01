export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// Ambil URL Ngrok dari Environment Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    
    // Minta data transaksi hari ini ke FastAPI
    const response = await fetch(`${API_URL}/api/transactions${url.search}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || 'Gagal mengambil data transaksi' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching transactions via proxy:', error);
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

    // 2. Tangkap data keranjang belanja dan nama kasir
    const body = await request.json();
    const cashierName = session.user.name;

    // 3. Sisipkan nama kasir ke dalam data yang akan dikirim ke Python
    const payload = {
      ...body,
      cashier_name: cashierName
    };

    // 4. Lempar data checkout ke FastAPI
    const response = await fetch(`${API_URL}/api/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || 'Gagal memproses transaksi' }, { status: response.status });
    }

    // Kembalikan nomor struk/invoice ke web
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying transaction to FastAPI:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}