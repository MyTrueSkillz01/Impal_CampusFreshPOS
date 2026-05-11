import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone } = body;
    
    // Basic validation
    if (!product_code || !name || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = await getDb();
    const stmt = await db.prepare(`
      UPDATE products 
      SET product_code = ?, image_url = ?, name = ?, category = ?, stock = ?, cost_price = ?, selling_price = ?, is_active = ?, seller_phone = ?
      WHERE id = ?
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
      seller_phone || '',
      id
    ]);

    await stmt.finalize();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Failed to update product', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const db = await getDb();
    
    const stmt = await db.prepare('DELETE FROM products WHERE id = ?');
    const result = await stmt.run([id]);
    await stmt.finalize();

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
