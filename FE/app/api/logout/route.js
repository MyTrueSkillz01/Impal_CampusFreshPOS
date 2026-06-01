import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth'; // Import fungsi logout

export async function POST() {
    await logout();
    return NextResponse.json({ success: true });
}