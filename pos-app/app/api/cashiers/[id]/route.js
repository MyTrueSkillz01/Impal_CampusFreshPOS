import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const { name, username, password, role, status } = await request.json();

    if (!name || !username || !role) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const db = await getDb();

    // Check if username exists for another id
    const existing = await db.get('SELECT id FROM cashiers WHERE username = ? AND id != ?', [username, id]);
    if (existing) {
      return NextResponse.json({ error: 'Username sudah terdaftar' }, { status: 400 });
    }

    let query = 'UPDATE cashiers SET name = ?, username = ?, role = ?, status = ?';
    let queryParams = [name, username, role, status || 'Aktif'];

    if (password) {
      // If password provided, update it too
      const encodedPassword = Buffer.from(password).toString('base64');
      query += ', password = ?';
      queryParams.push(encodedPassword);
    }

    query += ' WHERE id = ?';
    queryParams.push(id);

    await db.run(query, queryParams);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating cashier:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const db = await getDb();

    // Prevent deleting the currently logged in user if we wanted to
    if (session.user.id == id) {
      return NextResponse.json({ error: 'Tidak dapat menghapus akun Anda sendiri' }, { status: 400 });
    }

    await db.run('DELETE FROM cashiers WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cashier:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
