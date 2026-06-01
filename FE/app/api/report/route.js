export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth'; // Kita tetap simpan ini untuk keamanan akses

// Ambil URL Ngrok dari Environment Vercel
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
  try {
    // 1. Pengecekan sesi kasir (dipertahankan dari kode aslimu agar aman)
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil parameter tanggal dari URL
    const { searchParams } = new URL(request.url);
    let startDate = searchParams.get('startDate');
    let endDate = searchParams.get('endDate');

  if (!startDate || startDate === 'Semua' || startDate === 'null' || startDate === '') {
    startDate = '2000-01-01';
  }

  if (!endDate || endDate === 'null' || endDate === '') {
    endDate = new Date().toISOString().split('T')[0];
  }

    // 3. Tembak API FastAPI kamu! (Tidak pakai sqlite3/getDb lagi)
    const response = await fetch(`${API_URL}/api/report?start_date=${startDate}&end_date=${endDate}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ error: data.detail || 'Gagal mengambil data laporan' }, { status: response.status });
    }

    // 4. Langsung kembalikan hasil perhitungan dari Python ke layar web
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching report data via proxy:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}