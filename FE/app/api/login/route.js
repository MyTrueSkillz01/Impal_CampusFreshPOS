import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';
import { login } from '@/lib/auth';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Ensure DB is initialized
    await initDb();
    const db = await getDb();

    const encodedPassword = Buffer.from(password).toString('base64');

    // Check for plain text (backward compatibility) or base64 encoded password
    const cashier = await db.get(
      'SELECT id, username, name, role, status FROM cashiers WHERE username = ? AND (password = ? OR password = ?)',
      [username, password, encodedPassword]
    );

    if (cashier && cashier.status === 'Nonaktif') {
      return NextResponse.json(
        { error: 'Akun kasir ini telah dinonaktifkan' },
        { status: 403 }
      );
    }

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
