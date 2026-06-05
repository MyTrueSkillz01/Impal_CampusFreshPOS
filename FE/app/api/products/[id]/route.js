import { NextResponse } from 'next/server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function PUT(request, { params }) {
    const { id } = params;
    try {
        const body = await request.json();
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        
        const data = await response.json();
        if (!response.ok) return NextResponse.json({ error: 'Gagal update' }, { status: response.status });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const response = await fetch(`${API_URL}/api/products/${id}`, {
            method: 'DELETE',
        });
        
        const data = await response.json();
        if (!response.ok) return NextResponse.json({ error: 'Gagal hapus' }, { status: response.status });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}