import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET() {
    try {
        const response = await fetch(`${API_URL}/api/cashiers`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return NextResponse.json({ error: 'Gagal mengambil data' }, { status: response.status });
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching cashiers:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}