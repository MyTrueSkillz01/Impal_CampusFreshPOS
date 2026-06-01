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
    DROP TABLE IF EXISTS cashiers;
    CREATE TABLE cashiers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL
    );

    DROP TABLE IF EXISTS products;
    CREATE TABLE products (
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
  `);

  // Insert seed data
  const stmt = await db.prepare('INSERT INTO cashiers (username, password, name) VALUES (?, ?, ?)');
  await stmt.run(['kresna', 'hash_pw_001', 'Kresna Satriawansyah']);
  await stmt.run(['ihsan', 'hash_pw_002', 'Ihsan Dwika Putra']);
  await stmt.run(['raisya', 'hash_pw_003', 'Raisya Latifah']);
  await stmt.run(['wafiq', 'hash_pw_004', 'Wafiq Aditiya']);
  await stmt.run(['admin', 'hash_pw_005', 'Admin Kasir']);
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
