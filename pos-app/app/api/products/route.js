import { NextResponse } from 'next/server';
import { getDb, initDb } from '@/lib/db';

export async function GET(request) {
  try {
    await initDb();
    const db = await getDb();
    const products = await db.all('SELECT * FROM products ORDER BY id DESC');
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone } = body;
    
    // Basic validation
    if (!product_code || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const stmt = await db.prepare(`
      INSERT INTO products (product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = await stmt.run([
      product_code,
      image_url || '',
      name,
      category,
      parseInt(stock) || 0,
      parseInt(cost_price) || 0,
      parseInt(selling_price) || 0,
      is_active !== undefined ? (is_active ? 1 : 0) : 1,
      seller_phone || ''
    ]);

    await stmt.finalize();

    return NextResponse.json({ id: result.lastID, success: true }, { status: 201 });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: products.product_code')) {
      return NextResponse.json({ error: 'ID Produk sudah digunakan, silakan gunakan ID lain' }, { status: 400 });
    }
    console.error('Failed to create product:', error);
    return NextResponse.json({ error: 'Failed to create product', details: error.message }, { status: 500 });
  }
}
