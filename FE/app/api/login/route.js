import { NextResponse } from 'next/server';
import { login } from '@/lib/auth'; // Import fungsi login dari JWT buatanmu

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // 1. Minta validasi ke backend Azure
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // 2. Jika Azure merespons sukses, panggil fungsi JWT buatanmu!
        if (response.ok && data.success) {
            await login(data.user); 
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Gagal menghubungi Backend Azure:", error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}