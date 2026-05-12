from fastapi import FastAPI, HTTPException, Response, Cookie, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
import sqlite3
import json
from datetime import datetime
import uuid

app = FastAPI(title="CampusFreshPOS API")

# CORS - izinkan frontend Next.js akses backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "pos.sqlite"

# ─── Database Setup ────────────────────────────────────────────────

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Buat tabel yang sudah ada + tabel BARU (transactions, settlements, store_settings)
    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS cashiers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            name TEXT NOT NULL,
            role TEXT DEFAULT 'Kasir',
            status TEXT DEFAULT 'Aktif'
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

        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            username TEXT NOT NULL,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            daily_number INTEGER NOT NULL,
            invoice_number TEXT NOT NULL,
            cashier_name TEXT NOT NULL,
            total_amount INTEGER NOT NULL,
            items TEXT NOT NULL,
            customer_info TEXT,
            created_at DATETIME DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS settlements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_transactions INTEGER NOT NULL,
            total_revenue INTEGER NOT NULL,
            summary_data TEXT NOT NULL,
            created_at DATETIME DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS store_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        );
    """)

    # Seed store settings (Buka/Tutup Toko)
    if cursor.execute("SELECT COUNT(*) FROM store_settings WHERE key = 'is_open'").fetchone()[0] == 0:
        cursor.execute("INSERT INTO store_settings (key, value) VALUES ('is_open', 'true')")

    # Seed cashiers
    if cursor.execute("SELECT COUNT(*) FROM cashiers").fetchone()[0] == 0:
        cashiers = [
            ('kresna', 'hash_pw_001', 'Kresna Satriawansyah'),
            ('ihsan', 'hash_pw_002', 'Ihsan Dwika Putra'),
            ('raisya', 'hash_pw_003', 'Raisya Latifah'),
            ('wafiq', 'hash_pw_004', 'Wafiq Aditiya'),
            ('admin', 'hash_pw_005', 'Admin Kasir'),
        ]
        cursor.executemany("INSERT INTO cashiers (username, password, name) VALUES (?, ?, ?)", cashiers)

    # Seed products
    if cursor.execute("SELECT COUNT(*) FROM products").fetchone()[0] == 0:
        products = [
            ('P001', 'https://via.placeholder.com/150', 'Nametag PKKMB', 'Atribut', 100, 10000, 15000, 1, '6281234567890'),
            ('P002', 'https://via.placeholder.com/150', 'Buku Panduan PKKMB', 'Buku', 50, 20000, 35000, 1, '6281234567890'),
            ('P003', 'https://via.placeholder.com/150', 'Pin Logo Kampus', 'Atribut', 200, 5000, 10000, 1, '6281234567890'),
            ('P004', 'https://via.placeholder.com/150', 'Buku Tulis Eksekutif', 'Alat Tulis', 150, 15000, 25000, 1, '6281234567890')
        ]
        cursor.executemany("""
            INSERT INTO products (product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, products)

    conn.commit()
    conn.close()

init_db()

# ─── Models ────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class ProductCreate(BaseModel):
    product_code: str
    image_url: Optional[str] = ''
    name: str
    category: str
    stock: Optional[int] = 0
    cost_price: Optional[int] = 0
    selling_price: Optional[int] = 0
    is_active: Optional[bool] = True
    seller_phone: Optional[str] = ''

# ─── Auth Endpoints ────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "CampusFreshPOS API is running!", "status": "Online"}

@app.post("/api/login")
def login(body: LoginRequest, response: Response):
    conn = get_db()
    user = conn.execute(
        "SELECT id, username, name FROM cashiers WHERE username = ? AND password = ?",
        (body.username, body.password)
    ).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    token = str(uuid.uuid4())
    conn = get_db()
    conn.execute("INSERT INTO sessions (token, user_id, username, name) VALUES (?, ?, ?, ?)",
                 (token, user["id"], user["username"], user["name"]))
    conn.commit()
    conn.close()
    return {"success": True, "user": {"id": user["id"], "username": user["username"], "name": user["name"]}}

@app.post("/api/login")
def login(body: LoginRequest):
    conn = get_db()
    # (Pastikan tabel cashiers di Azure sudah punya kolom 'status' dan 'role')
    user = conn.execute("SELECT id, username, name, role, status FROM cashiers WHERE username = ? AND password = ?",
                        (body.username, body.password)).fetchone()
    conn.close()

    if not user:
        raise HTTPException(status_code=401, detail="Username atau password salah")

    # Cek jika akun nonaktif
    if user["status"] == "Nonaktif":
        raise HTTPException(status_code=403, detail="Akun kasir ini telah dinonaktifkan")

    return {"success": True, "user": {"id": user["id"], "username": user["username"], "name": user["name"], "role": user["role"], "status": user["status"]}}

@app.post("/api/logout")
def logout():
    return {"success": True}

# ─── Products Endpoints ─────────────────────────────────────────────
@app.get("/api/products")
def get_products():
    conn = get_db()
    products = conn.execute("SELECT * FROM products").fetchall()
    conn.close()
    return [dict(p) for p in products]

@app.post("/api/products")
def create_product(body: ProductCreate):
    conn = get_db()
    try:
        conn.execute("""
            INSERT INTO products (product_code, image_url, name, category, stock, cost_price, selling_price, is_active, seller_phone)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (body.product_code, body.image_url, body.name, body.category, body.stock, body.cost_price, body.selling_price, 1 if body.is_active else 0, body.seller_phone))
        conn.commit()
    except sqlite3.IntegrityError:
        raise HTTPException(status_code=400, detail="Product code sudah ada")
    finally:
        conn.close()
    return {"success": True}

@app.put("/api/products/{id}")
def update_product(id: int, body: ProductCreate):
    conn = get_db()
    conn.execute("""
        UPDATE products SET product_code=?, image_url=?, name=?, category=?, stock=?, cost_price=?, selling_price=?, is_active=?, seller_phone=? WHERE id=?
    """, (body.product_code, body.image_url, body.name, body.category, body.stock, body.cost_price, body.selling_price, 1 if body.is_active else 0, body.seller_phone, id))
    conn.commit()
    conn.close()
    return {"success": True}

@app.delete("/api/products/{id}")
def delete_product(id: int):
    conn = get_db()
    conn.execute("DELETE FROM products WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"success": True}

# ─── Transactions & Checkout ────────────────────────────────────────
@app.get("/api/transactions")
def get_transactions():
    conn = get_db()
    tx = conn.execute("SELECT * FROM transactions ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(t) for t in tx]

@app.post("/api/transactions")
async def create_transaction(request: Request):
    body = await request.json()
    cart = body.get("cart", [])
    total_amount = body.get("totalAmount", 0)
    cashier_name = body.get("cashier_name", "Unknown")
    customer_info = body.get("customerInfo", None)

    if not cart:
        raise HTTPException(status_code=400, detail="Cart is empty")

    conn = get_db()
    # Cek toko buka/tutup
    is_open = conn.execute("SELECT value FROM store_settings WHERE key='is_open'").fetchone()
    if is_open and is_open["value"] == 'false':
        conn.close()
        raise HTTPException(status_code=400, detail="Kasir sedang ditutup!")

    # Kurangi stok
    for item in cart:
        conn.execute("UPDATE products SET stock = stock - ? WHERE id = ?", (item["qty"], item["id"]))

    # Hitung daily number & Buat Invoice
    today = datetime.now()
    daily_count = conn.execute("SELECT COUNT(*) FROM transactions WHERE date(created_at) = date('now', 'localtime')").fetchone()[0]
    daily_number = daily_count + 1

    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO transactions (daily_number, invoice_number, cashier_name, total_amount, items, customer_info)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (daily_number, "TEMP", cashier_name, total_amount, json.dumps(cart), json.dumps(customer_info) if customer_info else None))

    new_id = cursor.lastrowid
    invoice_number = f"INV-{today.strftime('%Y%m%d')}-{new_id}-{daily_number}"
    cursor.execute("UPDATE transactions SET invoice_number = ? WHERE id = ?", (invoice_number, new_id))

    conn.commit()
    conn.close()
    return {"success": True, "id": new_id, "invoice_number": invoice_number}

# ─── Report & Settlement ────────────────────────────────────────
@app.get("/api/report")
def get_report(startDate: str, endDate: str):
    conn = get_db()
    transactions = conn.execute("""
        SELECT * FROM transactions WHERE date(created_at) BETWEEN ? AND ? ORDER BY id DESC
    """, (startDate, endDate)).fetchall()

    total_revenue = 0
    total_hpp = 0
    products_sold = 0

    for tx in transactions:
        total_revenue += tx["total_amount"]
        items = json.loads(tx["items"])
        for item in items:
            products_sold += item.get("qty", 0)
            total_hpp += (item.get("cost_price", 0) * item.get("qty", 0))

    conn.close()
    return {
        "summary": {
            "totalTransactions": len(transactions),
            "productsSold": products_sold,
            "totalSubtotal": total_revenue,
            "totalHPP": total_hpp,
            "grossProfit": total_revenue - total_hpp,
            "totalFinalRevenue": total_revenue
        },
        "transactions": [dict(t) for t in transactions],
        "itemDetails": [] # Disederhanakan untuk keperluan demo
    }

@app.get("/api/settlement")
def get_settlement_status():
    conn = get_db()
    status = conn.execute("SELECT value FROM store_settings WHERE key='is_open'").fetchone()
    tx = conn.execute("SELECT * FROM transactions WHERE date(created_at) = date('now', 'localtime')").fetchall()
    conn.close()

    total_revenue = sum([t["total_amount"] for t in tx])
    return {
        "isOpen": True if status and status["value"] == 'true' else False,
        "totalTransactions": len(tx),
        "totalRevenue": total_revenue,
        "itemDetails": []
    }

@app.post("/api/settlement")
async def toggle_settlement(request: Request):
    body = await request.json()
    action = body.get("action")
    conn = get_db()

    if action == 'open':
        conn.execute("UPDATE store_settings SET value = 'true' WHERE key = 'is_open'")
        conn.commit()
        conn.close()
        return {"success": True, "isOpen": True}
    elif action == 'close':
        tx = conn.execute("SELECT * FROM transactions WHERE date(created_at) = date('now', 'localtime')").fetchall()
        total_revenue = sum([t["total_amount"] for t in tx])
        today_date = datetime.now().strftime('%Y-%m-%d')

        conn.execute("INSERT INTO settlements (date, total_transactions, total_revenue, summary_data) VALUES (?, ?, ?, ?)",
                     (today_date, len(tx), total_revenue, "[]"))
        conn.execute("UPDATE store_settings SET value = 'false' WHERE key = 'is_open'")
        conn.commit()
        conn.close()
        return {"success": True, "isOpen": False}

    conn.close()
    raise HTTPException(status_code=400, detail="Invalid action")