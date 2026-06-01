export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
    try {
        const url = new URL(request.url);
        // url.search digunakan agar fitur pencarian / filter web tetap terbawa ke backend
        const response = await fetch(`${API_URL}/api/products${url.search}`);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const response = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}