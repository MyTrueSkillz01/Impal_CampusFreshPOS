import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!startDate || !endDate) {
      return NextResponse.json({ error: 'startDate and endDate are required' }, { status: 400 });
    }

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

    const transactions = await db.all(`
      SELECT * FROM transactions 
      WHERE date(created_at, 'localtime') BETWEEN ? AND ?
      ORDER BY id DESC
    `, [startDate, endDate]);

    let totalTransactions = transactions.length;
    let productsSold = 0;
    let totalHPP = 0;
    let totalSubtotal = 0;

    const itemsMap = new Map();

    for (const tx of transactions) {
      totalSubtotal += tx.total_amount;
      try {
        const items = JSON.parse(tx.items);
        for (const item of items) {
          productsSold += item.qty;
          const costPrice = item.cost_price || 0;
          totalHPP += (costPrice * item.qty);

          if (itemsMap.has(item.name)) {
            const existing = itemsMap.get(item.name);
            existing.qty += item.qty;
            existing.totalSales += (item.price * item.qty);
          } else {
            itemsMap.set(item.name, {
              name: item.name,
              qty: item.qty,
              sellingPrice: item.price,
              totalSales: item.price * item.qty
            });
          }
        }
      } catch (e) {
        console.error('Error parsing items for tx:', tx.id);
      }
    }

    const grossProfit = totalSubtotal - totalHPP;
    // Total Pendapatan Akhir could be same as Subtotal if no tax/service
    const totalFinalRevenue = totalSubtotal; 

    const itemDetails = Array.from(itemsMap.values());

    return NextResponse.json({
      summary: {
        totalTransactions,
        productsSold,
        totalHPP,
        totalSubtotal,
        grossProfit,
        totalFinalRevenue
      },
      transactions,
      itemDetails
    });

  } catch (error) {
    console.error('Error fetching report data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
