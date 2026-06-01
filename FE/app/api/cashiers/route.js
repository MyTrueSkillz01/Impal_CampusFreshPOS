import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Minta validasi ke Azure
        const response = await fetch(`${API_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // Jika Azure bilang sukses, buatkan cookie sesi di Vercel!
        if (response.ok && data.success) {
            cookies().set('user_session', JSON.stringify({ user: data.user }), {
                path: '/',
                httpOnly: true,
                sameSite: 'lax'
            });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}