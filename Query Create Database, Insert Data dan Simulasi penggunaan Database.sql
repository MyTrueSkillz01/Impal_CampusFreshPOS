CREATE DATABASE impal_campusfreshpos;
USE impal_campusfreshpos;

-- TABEL KASIR (username sebagai PK)
CREATE TABLE kasir (
    username VARCHAR(50) PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL
);

-- TABEL PELANGGAN
CREATE TABLE pelanggan (
    nim VARCHAR(20) PRIMARY KEY,
    nama_pembeli VARCHAR(100) NOT NULL,
    no_telp VARCHAR(15),
    alamat TEXT
);

-- TABEL PRODUK
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

-- TABEL PESANAN
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

-- TABEL DETAIL PESANAN
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

-- ==========================================================
-- 2. INSERT DATA DUMMY
-- ==========================================================

-- Data Kasir
INSERT INTO kasir (username, password_hash, nama) VALUES
('kresna', 'hash_pw_001', 'Kresna Satriawansyah'),
('ihsan', 'hash_pw_002', 'Ihsan Dwika Putra'),
('raisya', 'hash_pw_003', 'Raisya Latifah'),
('wafiq', 'hash_pw_004', 'Wafiq Aditiya'),
('admin', 'hash_pw_005', 'Admin Kasir');

-- Data Pelanggan
INSERT INTO pelanggan (nim, nama_pembeli, no_telp, alamat) VALUES
('1301213004', 'Fajar Ramadhan', '08123456004', 'Kosan Sukabirus'),
('1301213005', 'Giska Putri', '08123456005', 'Asrama Putri Gedung B'),
('1301213006', 'Hendra Wijaya', '08123456006', 'Kosan PGA'),
('1301213007', 'Indah Permata', '08123456007', 'Apartemen Transit'),
('1301213008', 'Jaka Tarub', '08123456008', 'Kosan Adhyaksa'),
('1301213009', 'Karin Amelia', '08123456009', 'Asrama Putri Gedung D'),
('1301213010', 'Luthfi Hakim', '08123456010', 'Kosan Sukapura'),
('1301213011', 'Maulana Malik', '08123456011', 'Asrama Putra Gedung E'),
('1301213012', 'Nadia Safira', '08123456012', 'Kosan Mengger'),
('1301213013', 'Oky Pratama', '08123456013', 'Kosan Bojongsoang Dalam');

-- Data 10 Produk Perlengkapan Maba
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

-- Data Pesanan Awal
INSERT INTO pesanan (nomer_pesanan, invoice, waktu, catatan_pemesanan, bukti_pembayaran, status_pesanan, total_bayar, username_kasir, nim) VALUES
('ORD-004', 'INV-004', '2023-08-02 08:30:00', 'Segera kirim', 'tf_004.jpg', 'Selesai', 215000, 'kresna', '1301213004'),
('ORD-005', 'INV-005', '2023-08-02 13:00:00', '-', 'tf_005.jpg', 'Selesai', 120000, 'ihsan', '1301213005'),
('ORD-006', 'INV-006', '2023-08-03 09:45:00', 'Warna hitam saja', 'tf_006.jpg', 'Proses', 25000, 'raisya', '1301213006'),
('ORD-007', 'INV-007', '2023-08-03 14:20:00', 'Ambil jam 4 sore', 'tf_007.jpg', 'Batal', 75000, 'kresna', '1301213007'),
('ORD-008', 'INV-008', '2023-08-04 10:10:00', '-', 'tf_008.jpg', 'Selesai', 110000, 'ihsan', '1301213008'),
('ORD-009', 'INV-009', '2023-08-04 16:30:00', 'Kirim ke asrama', 'tf_009.jpg', 'Proses', 200000, 'raisya', '1301213009'),
('ORD-010', 'INV-010', '2023-08-05 11:00:00', 'Titip teman', 'tf_010.jpg', 'Selesai', 15000, 'kresna', '1301213010'),
('ORD-011', 'INV-011', '2023-08-05 15:45:00', '-', 'tf_011.jpg', 'Selesai', 55000, 'ihsan', '1301213011'),
('ORD-012', 'INV-012', '2023-08-06 08:00:00', 'Packaging aman', 'tf_012.jpg', 'Selesai', 60000, 'raisya', '1301213012'),
('ORD-013', 'INV-013', '2023-08-06 12:20:00', 'Urgent', 'tf_013.jpg', 'Selesai', 185000, 'kresna', '1301213013');

-- Data Detail Pesanan Awal
INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) VALUES
(1, 120000, 90000, 120000, 'ORD-004', 'PRD12'),
(1, 95000, 75000, 95000, 'ORD-004', 'PRD11'),
(1, 120000, 90000, 120000, 'ORD-005', 'PRD12'),
(1, 25000, 15000, 25000, 'ORD-006', 'PRD13'),
(1, 75000, 45000, 75000, 'ORD-007', 'PRD15'),
(2, 55000, 30000, 110000, 'ORD-008', 'PRD17'),
(1, 200000, 150000, 200000, 'ORD-009', 'PRD10'),
(1, 15000, 8000, 15000, 'ORD-010', 'PRD16'),
(1, 55000, 30000, 55000, 'ORD-011', 'PRD17'),
(1, 60000, 35000, 60000, 'ORD-012', 'PRD19'),
(1, 185000, 120000, 185000, 'ORD-013', 'PRD20');

-- ==========================================================
-- 3. SIMULASI OPERASIONAL
-- ==========================================================

-- [Proses 1] Login
SELECT * FROM kasir WHERE username = 'kresna' AND password_hash = 'hash_pw_001';

-- [Proses 2] Lihat Stok
SELECT id_produk, nama_produk, harga_jual, stock FROM produk WHERE status_aktif = TRUE;

-- [Proses 3] Transaksi Baru (Checkout)
INSERT IGNORE INTO pelanggan (nim, nama_pembeli, no_telp, alamat) VALUES ('1301213004', 'Fajar', '0855667788', 'Asrama');

INSERT INTO pesanan (nomer_pesanan, invoice, catatan_pemesanan, total_bayar, username_kasir, nim) 
VALUES ('ORD-004', 'INV-004', 'Cepat ya', 60000, 'kresna', '1301213004');

INSERT INTO detail_pesanan (qty, harga_satuan, harga_modal_satuan, subtotal_harga, nomer_pesanan, id_produk) 
VALUES (2, 30000, 20000, 60000, 'ORD-004', 'PRD06');

UPDATE produk SET stock = stock - 2 WHERE id_produk = 'PRD06';

UPDATE pesanan SET status_pesanan = 'Selesai' WHERE nomer_pesanan = 'ORD-004';

-- [Proses 4] Laporan Settlement
SELECT 
    COUNT(DISTINCT ps.nomer_pesanan) AS total_transaksi,
    SUM(dp.qty) AS produk_terjual,
    SUM(dp.qty * dp.harga_modal_satuan) AS total_modal_hpp,
    SUM(ps.total_bayar) AS total_pendapatan_akhir,
    (SUM(ps.total_bayar) - SUM(dp.qty * dp.harga_modal_satuan)) AS laba_kotor
FROM pesanan ps
JOIN detail_pesanan dp ON ps.nomer_pesanan = dp.nomer_pesanan
WHERE ps.status_pesanan = 'Selesai';
