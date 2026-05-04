import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const db = await getDb();
    
    // Ensure table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_number INTEGER NOT NULL,
        invoice_number TEXT NOT NULL,
        cashier_name TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Fetch today's transactions
    // Using date('now', 'localtime')
    const transactions = await db.all(`
      SELECT * FROM transactions 
      WHERE date(created_at, 'localtime') = date('now', 'localtime')
      ORDER BY id DESC
    `);
    
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cart, totalAmount, customerInfo } = await request.json();
    
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const db = await getDb();
    const cashierName = session.user.name;

    // Check if store is open
    try {
      const statusRow = await db.get(`SELECT value FROM store_settings WHERE key = 'is_open'`);
      if (statusRow && statusRow.value === 'false') {
        return NextResponse.json({ error: 'Kasir sudah ditutup' }, { status: 400 });
      }
    } catch (e) {}

    // Ensure table exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        daily_number INTEGER NOT NULL,
        invoice_number TEXT NOT NULL,
        cashier_name TEXT NOT NULL,
        total_amount INTEGER NOT NULL,
        items TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add customer_info column if it doesn't exist
    try {
      await db.exec('ALTER TABLE transactions ADD COLUMN customer_info TEXT;');
    } catch (e) {
      // Column might already exist, ignore error
    }

    // Get current date in Jakarta timezone for YYYYMMDD
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }));
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yyyymmdd = `${yyyy}${mm}${dd}`;

    // Get daily count for today
    const dailyCountRow = await db.get(`
      SELECT COUNT(*) as count 
      FROM transactions 
      WHERE date(created_at, 'localtime') = date('now', 'localtime')
    `);
    const dailyNumber = dailyCountRow.count + 1;

    // Insert first to get the auto-increment ID
    const result = await db.run(
      'INSERT INTO transactions (daily_number, invoice_number, cashier_name, total_amount, items, customer_info) VALUES (?, ?, ?, ?, ?, ?)',
      [dailyNumber, 'TEMP', cashierName, totalAmount, JSON.stringify(cart), customerInfo ? JSON.stringify(customerInfo) : null]
    );

    const newId = result.lastID;
    const invoiceNumber = `INV-${yyyymmdd}-${newId}-${dailyNumber}`;

    // Update with the final invoice number
    await db.run(
      'UPDATE transactions SET invoice_number = ? WHERE id = ?',
      [invoiceNumber, newId]
    );

    return NextResponse.json({ success: true, id: newId, invoice_number: invoiceNumber });
  } catch (error) {
    console.error('Error saving transaction:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
