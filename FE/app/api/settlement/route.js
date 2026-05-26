import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

// Helper to init tables
async function ensureTables(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS store_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      total_transactions INTEGER NOT NULL,
      total_revenue INTEGER NOT NULL,
      summary_data TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Initialize store status if it doesn't exist
  const status = await db.get(`SELECT value FROM store_settings WHERE key = 'is_open'`);
  if (!status) {
    await db.run(`INSERT INTO store_settings (key, value) VALUES ('is_open', 'true')`);
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDb();
    await ensureTables(db);

    // Get store status
    const statusRow = await db.get(`SELECT value FROM store_settings WHERE key = 'is_open'`);
    const isOpen = statusRow ? statusRow.value === 'true' : true;

    // Get today's transactions
    const transactions = await db.all(`
      SELECT * FROM transactions 
      WHERE date(created_at, 'localtime') = date('now', 'localtime')
    `);

    let totalRevenue = 0;
    const itemsMap = new Map();

    for (const tx of transactions) {
      totalRevenue += tx.total_amount;
      try {
        const items = JSON.parse(tx.items);
        for (const item of items) {
          if (itemsMap.has(item.name)) {
            const existing = itemsMap.get(item.name);
            existing.qty += item.qty;
            existing.total += (item.price * item.qty);
          } else {
            itemsMap.set(item.name, {
              name: item.name,
              qty: item.qty,
              total: item.price * item.qty
            });
          }
        }
      } catch (e) {}
    }

    const itemDetails = Array.from(itemsMap.values());

    return NextResponse.json({
      isOpen,
      totalTransactions: transactions.length,
      totalRevenue,
      itemDetails
    });

  } catch (error) {
    console.error('Error fetching settlement data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const db = await getDb();
    await ensureTables(db);

    if (action === 'open') {
      await db.run(`UPDATE store_settings SET value = 'true' WHERE key = 'is_open'`);
      return NextResponse.json({ success: true, isOpen: true });
    } else if (action === 'close') {
      // Fetch today's transactions for the report
      const transactions = await db.all(`
        SELECT * FROM transactions 
        WHERE date(created_at, 'localtime') = date('now', 'localtime')
      `);

      let totalRevenue = 0;
      const itemsMap = new Map();

      for (const tx of transactions) {
        totalRevenue += tx.total_amount;
        try {
          const items = JSON.parse(tx.items);
          for (const item of items) {
            if (itemsMap.has(item.name)) {
              const existing = itemsMap.get(item.name);
              existing.qty += item.qty;
              existing.total += (item.price * item.qty);
            } else {
              itemsMap.set(item.name, {
                name: item.name,
                qty: item.qty,
                total: item.price * item.qty
              });
            }
          }
        } catch (e) {}
      }

      const itemDetails = Array.from(itemsMap.values());
      const summaryData = JSON.stringify(itemDetails);

      // Create settlement record
      const todayDate = new Date().toISOString().split('T')[0];
      await db.run(`
        INSERT INTO settlements (date, total_transactions, total_revenue, summary_data)
        VALUES (?, ?, ?, ?)
      `, [todayDate, transactions.length, totalRevenue, summaryData]);

      // Set store as closed
      await db.run(`UPDATE store_settings SET value = 'false' WHERE key = 'is_open'`);
      
      return NextResponse.json({ success: true, isOpen: false });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error processing settlement action:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
