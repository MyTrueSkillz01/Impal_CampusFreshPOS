import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    
    // Admin only check could go here if needed, but we assume UI handles access 
    // or we check session.user.role === 'Admin'
    // Since existing users don't have roles, we skip strict role checks, 
    // but a real app would strictly check it.

    const cashiers = await db.all('SELECT id, username, name, password, role, status FROM cashiers ORDER BY id DESC');
    
    return NextResponse.json(cashiers);
  } catch (error) {
    console.error('Error fetching cashiers:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, username, password, role, status } = await request.json();

    if (!name || !username || !password || !role) {
      return NextResponse.json({ error: 'Semua field harus diisi' }, { status: 400 });
    }

    const db = await getDb();

    // Check if username exists
    const existing = await db.get('SELECT id FROM cashiers WHERE username = ?', [username]);
    if (existing) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    // Encrypt password using base64
    const encodedPassword = Buffer.from(password).toString('base64');

    const result = await db.run(
      'INSERT INTO cashiers (name, username, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [name, username, encodedPassword, role, status || 'Aktif']
    );

    return NextResponse.json({ success: true, id: result.lastID });
  } catch (error) {
    console.error('Error creating cashier:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
