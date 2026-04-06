CREATE DATABASE IF NOT EXISTS impal_campusfreshpos;
USE impal_campusfreshpos;

-- 1. TABEL KASIR (Revisi: id_kasir dihapus, username jadi PK)
CREATE TABLE kasir (
    username VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- 2. TABEL PELANGGAN
CREATE TABLE pelanggan (
    nim VARCHAR(20) PRIMARY KEY,
    nama_pembeli VARCHAR(100) NOT NULL,
    no_telp VARCHAR(15),
    alamat TEXT
);

-- 3. TABEL PRODUK
CREATE TABLE produk (
    id_produk VARCHAR(10) PRIMARY KEY,
    nama_produk VARCHAR(150) NOT NULL,
    gambar_produk TEXT,
    kategori VARCHAR(50),
    stock INT DEFAULT 0,
    harga_modal DECIMAL(10, 2) NOT NULL,
    harga_jual DECIMAL(10, 2) NOT NULL,
    status_aktif BOOLEAN DEFAULT TRUE,
    kontak_penjual VARCHAR(15)
);

-- 4. TABEL PESANAN (Revisi: Foreign Key merujuk ke username kasir)
CREATE TABLE pesanan (
    nomer_pesanan VARCHAR(20) PRIMARY KEY,
    invoice VARCHAR(30) UNIQUE NOT NULL,
    waktu DATETIME DEFAULT CURRENT_TIMESTAMP,
    catatan_pemesanan TEXT,
    bukti_pembayaran TEXT,
    status_pesanan VARCHAR(20) DEFAULT 'Proses',
    total_bayar DECIMAL(10, 2) DEFAULT 0,
    username_kasir VARCHAR(50), 
    nim VARCHAR(20),
    FOREIGN KEY (username_kasir) REFERENCES kasir(username),
    FOREIGN KEY (nim) REFERENCES pelanggan(nim)
);

-- 5. TABEL DETAIL PESANAN
CREATE TABLE detail_pesanan (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    qty INT NOT NULL,
    harga_satuan DECIMAL(10, 2) NOT NULL,
    harga_modal_satuan DECIMAL(10, 2) NOT NULL,
    subtotal_harga DECIMAL(10, 2) NOT NULL,
    nomer_pesanan VARCHAR(20),
    id_produk VARCHAR(10),
    FOREIGN KEY (nomer_pesanan) REFERENCES pesanan(nomer_pesanan),
    FOREIGN KEY (id_produk) REFERENCES produk(id_produk)
);


-- Insert Dummy Data Semua
-- Insert Dummy Kasir
INSERT INTO kasir (username, password_hash, nama) VALUES
('kresna', 'hash_pw_001', 'Kresna Satriawansyah'),
('ihsan', 'hash_pw_002', 'Ihsan Dwika Putra'),
('raisya', 'hash_pw_003', 'Raisya Latifah'),
('wafiq', 'hash_pw_004', 'Wafiq Aditiya'),
('admin', 'hash_pw_005', 'Admin Kasir');

-- Insert Dummy Pelanggan (Mahasiswa Baru)
INSERT INTO pelanggan (nim, nama_pembeli, no_telp, alamat) VALUES
('1301213001', 'Citra Kirana', '08123456001', 'Asrama Putri Gedung A'),
('1301213002', 'Dimas Anggara', '08123456002', 'Kosan Bojongsoang'),
('1301213003', 'Eka Putra', '08123456003', 'Asrama Putra Gedung C');

-- Insert 10 Dummy Produk (Perlengkapan Maba)
INSERT INTO produk (id_produk, nama_produk, gambar_produk, kategori, stock, harga_modal, harga_jual, status_aktif, kontak_penjual) VALUES
('PRD01', 'Jas Almamater Ukuran M', 'url_jas_m.jpg', 'Pakaian', 50, 120000, 150000, TRUE, '0899112233'),
('PRD02', 'Jas Almamater Ukuran L', 'url_jas_l.jpg', 'Pakaian', 50, 120000, 150000, TRUE, '0899112233'),
('PRD03', 'Dasi Kampus', 'url_dasi.jpg', 'Aksesoris', 100, 15000, 25000, TRUE, '0899112233'),
('PRD04', 'Topi Ospek', 'url_topi.jpg', 'Aksesoris', 100, 10000, 20000, TRUE, '0899112233'),
('PRD05', 'Kaos Olahraga Maba', 'url_kaos.jpg', 'Pakaian', 75, 45000, 65000, TRUE, '0899445566'),
('PRD06', 'Buku Tulis Custom Kampus', 'url_buku.jpg', 'ATK', 200, 3000, 6000, TRUE, '0811223344'),
('PRD07', 'Pulpen Logo Kampus', 'url_pulpen.jpg', 'ATK', 300, 2000, 5000, TRUE, '0811223344'),
('PRD08', 'Totebag Kanvas', 'url_totebag.jpg', 'Aksesoris', 80, 25000, 40000, TRUE, '0811223344'),
('PRD09', 'Lanyard ID Card', 'url_lanyard.jpg', 'Aksesoris', 150, 8000, 15000, TRUE, '0899112233'),
('PRD10', 'Sepatu Pantofel Hitam', 'url_sepatu.jpg', 'Pakaian', 20, 150000, 200000, TRUE, '0877665544');

-- Insert Dummy Pesanan (Selesai & Proses)
INSERT INTO pesanan (nomer_pesanan, invoice, waktu, catatan_pemesanan, bukti_pembayaran, status_pesanan, total_bayar, id_kasir, nim) VALUES
('ORD-001', 'INV-001', '2023-08-01 09:00:00', 'Ambil di tempat', 'tf_001.jpg', 'Selesai', 175000, 'KSR01', '1301213001'),
('ORD-002', 'INV-002', '2023-08-01 10:15:00', 'Titip di satpam', 'tf_002.jpg', 'Selesai', 85000, 'KSR02', '1301213002'),
('ORD-003', 'INV-003', '2023-08-01 11:30:00', '-', 'tf_003.jpg', 'Proses', 40000, 'KSR01', '1301213003');

-- Insert Dummy Detail Pesanan
-- Detail ORD-001 (Citra beli Jas M & Dasi)
INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) VALUES
(1, 150000, 120000, 150000, 'ORD-001', 'PRD01'),
(1, 25000, 15000, 25000, 'ORD-001', 'PRD03');
-- Detail ORD-002 (Dimas beli Kaos & Topi)
INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) VALUES
(1, 65000, 45000, 65000, 'ORD-002', 'PRD05'),
(1, 20000, 10000, 20000, 'ORD-002', 'PRD04');
-- Detail ORD-003 (Eka beli Totebag)
INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) VALUES
(1, 40000, 25000, 40000, 'ORD-003', 'PRD08');


-- SIMULASI OPERASIONAL
-- [Proses 1] Simulasi Login Kasir
SELECT id_kasir, nama FROM kasir WHERE username = 'andi_kasir' AND password_hash = 'hash_12345';

-- [Proses 2] Simulasi Menampilkan Katalog Produk
SELECT id_produk, nama_produk, harga_jual, stock FROM produk WHERE status_aktif = TRUE;

-- [Proses 3] Simulasi Kasir Memproses Pesanan Baru (Checkout)
-- A. Masukkan Pelanggan (Jika belum ada)
INSERT IGNORE INTO pelanggan (nim, nama_pembeli, no_telp, alamat) VALUES ('1301213004', 'Fajar', '0855667788', 'Asrama');
-- B. Buat Header Pesanan
INSERT INTO pesanan (nomer_pesanan, invoice, catatan_pemesanan, bukti_pembayaran, total_bayar, id_kasir, nim) 
VALUES ('ORD-004', 'INV-004', 'Cepat ya', 'bukti.jpg', 60000, 'KSR01', '1301213004');
-- C. Masukkan Item Keranjang
INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) 
VALUES (2, 30000, 20000, 60000, 'ORD-004', 'PRD06');
-- D. Kurangi Stok
UPDATE produk SET stock = stock - 2 WHERE id_produk = 'PRD06';
-- E. Kasir Konfirmasi Pesanan Selesai
UPDATE pesanan SET status_pesanan = 'Selesai' WHERE nomer_pesanan = 'ORD-004';

-- [Proses 4] Simulasi Settlement (Laporan Tutup Kasir Hari Ini)
SELECT 
    COUNT(DISTINCT ps.nomer_pesanan) AS total_transaksi,
    SUM(dp.qty) AS produk_terjual,
    SUM(dp.qty * dp.harga_modal_satuan) AS total_modal_hpp,
    SUM(ps.total_bayar) AS total_pendapatan_akhir,
    (SUM(ps.total_bayar) - SUM(dp.qty * dp.harga_modal_satuan)) AS laba_kotor
FROM pesanan ps
JOIN detail_pesanan dp ON ps.nomer_pesanan = dp.nomer_pesanan
WHERE ps.status_pesanan = 'Selesai';
