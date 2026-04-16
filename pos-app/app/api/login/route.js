import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { login } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Ensure DB is initialized
    await initDb();
    const db = await getDb();

    // In a real app, hash the password and compare!
    const cashier = await db.get(
      'SELECT id, username, name FROM cashiers WHERE username = ? AND password = ?',
      [username, password]
    );

    if (!cashier) {
      return NextResponse.json(
        { error: 'Username atau password salah' },
        { status: 401 }
      );
    }

    // Set session
    await login(cashier);

    return NextResponse.json({ success: true, user: cashier });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
