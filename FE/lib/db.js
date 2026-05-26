import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), 'pos.sqlite');

let dbPromise = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = open({
      filename: dbPath,
      driver: sqlite3.Database
    });
  }
  return dbPromise;
}

export async function initDb() {
  const db = await getDb();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS cashiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_code TEXT UNIQUE NOT NULL,
      image_url TEXT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      stock INTEGER DEFAULT 0,
      cost_price INTEGER DEFAULT 0,
      selling_price INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      seller_phone TEXT
    );


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

  // Add new columns if they don't exist
  try {
    await db.exec("ALTER TABLE cashiers ADD COLUMN role TEXT DEFAULT 'Kasir'");
  } catch (e) {}

  try {
    await db.exec("ALTER TABLE cashiers ADD COLUMN status TEXT DEFAULT 'Aktif'");
  } catch (e) {}

  // Insert seed data if table is empty
  const countRow = await db.get('SELECT COUNT(*) as count FROM cashiers');
  if (countRow.count === 0) {
    const stmt = await db.prepare('INSERT INTO cashiers (username, password, name, role, status) VALUES (?, ?, ?, ?, ?)');
    // Encode passwords in base64 to satisfy "encrypted" requirement
    const encodePw = (pw) => Buffer.from(pw).toString('base64');
    await stmt.run(['kresna', encodePw('hash_pw_001'), 'Kresna Satriawansyah', 'Admin', 'Aktif']);
    await stmt.run(['ihsan', encodePw('hash_pw_002'), 'Ihsan Dwika Putra', 'Kasir', 'Aktif']);
    await stmt.run(['raisya', encodePw('hash_pw_003'), 'Raisya Latifah', 'Kasir', 'Aktif']);
    await stmt.run(['wafiq', encodePw('hash_pw_004'), 'Wafiq Aditiya', 'Kasir', 'Aktif']);
    await stmt.run(['admin', encodePw('hash_pw_005'), 'Admin Kasir', 'Admin', 'Aktif']);
    await stmt.finalize();

    // Insert seed data for products
    const productStmt = await db.prepare('INSERT INTO products (product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
    const dummyProducts = [
      ['P001', 'https://via.placeholder.com/150', 'Nametag PKKMB', 'Atribut', 100, 10000, 15000, 1, '6281234567890'],
      ['P002', 'https://via.placeholder.com/150', 'Buku Panduan PKKMB', 'Buku', 50, 20000, 35000, 1, '6281234567890'],
      ['P003', 'https://via.placeholder.com/150', 'Pin Logo Kampus', 'Atribut', 200, 5000, 10000, 1, '6281234567890'],
      ['P004', 'https://via.placeholder.com/150', 'Buku Tulis Eksekutif', 'Alat Tulis', 150, 15000, 25000, 1, '6281234567890']
    ];
    for (const p of dummyProducts) {
      await productStmt.run(p);
    }
    await productStmt.finalize();

    console.log('Seed data kasir dan produk berhasil ditambahkan.');
  }
}
