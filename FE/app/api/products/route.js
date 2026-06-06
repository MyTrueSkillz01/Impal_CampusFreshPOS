export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
    const url = new URL(request.url);
    const response = await fetch(`${API_URL}/api/products${url.search}`);
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}

export async function POST(request) {
    const body = await request.json();
    const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
}