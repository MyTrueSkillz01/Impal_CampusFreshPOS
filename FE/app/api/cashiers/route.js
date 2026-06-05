export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function GET(request) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userRole = session.user.role;

        const response = await fetch(`${API_URL}/api/cashiers?requester_role=${userRole}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
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

export async function POST(request) {
    try {
        const body = await request.json();
        const response = await fetch(`${API_URL}/api/cashiers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        const data = await response.json();
        if (!response.ok) {
            return NextResponse.json({ error: data.detail || 'Gagal menambah karyawan' }, { status: response.status });
        }
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error adding cashier:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}