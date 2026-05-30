'use client';

import { useState, useRef, useEffect } from 'react';
import { Printer, Download, Calendar } from 'lucide-react';
import styles from './Report.module.css';

export default function Report() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const reportRef = useRef(null);

  const today = new Date();
  const todayFormatted = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setIsLoading(true);
    setError('');

    try {
      const queryParams = new URLSearchParams();
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      const res = await fetch(`/api/report?${queryParams.toString()}`);
      if (!res.ok) {
        throw new Error('Gagal memuat laporan');
      }
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const element = reportRef.current;
    if (!element) return;

    try {
      // Import dynamically to avoid SSR issues
      const html2pdf = (await import('html2pdf.js')).default;
      
      const opt = {
        margin:       10,
        filename:     `Laporan_Penjualan_${startDate}_to_${endDate}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      // Temporarily hide actions for PDF generation if needed, 
      // but usually we can just target a specific container
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Gagal membuat PDF. Pastikan browser Anda mendukung fitur ini.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Laporan Penjualan Detail</h1>
        
        <div className={styles.filterForm}>
          <div className={styles.inputGroup}>
            <label>Dari Tanggal</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={startDate ? "date" : "text"}
                placeholder="Semua"
                onFocus={(e) => e.target.type = 'date'}
                onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
                className={styles.dateInput} 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label>Sampai Tanggal</label>
            <input 
              type={endDate ? "date" : "text"}
              placeholder={todayFormatted}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => { if (!e.target.value) e.target.type = 'text'; }}
              className={styles.dateInput} 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          
          <button 
            className={styles.btnFilter}
            onClick={fetchReport}
            disabled={isLoading}
          >
            {isLoading ? 'Memuat...' : 'Filter Laporan'}
          </button>

          <div className={styles.actions}>
            <button 
              className={styles.btnAction} 
              onClick={handleDownloadPDF}
              disabled={!reportData || isLoading}
            >
              <Download size={18} />
              Download PDF A4
            </button>
            <button 
              className={styles.btnAction} 
              onClick={handlePrint}
              disabled={!reportData || isLoading}
            >
              <Printer size={18} />
              Cetak
            </button>
          </div>
        </div>
        
        {error && <div style={{ color: 'var(--error)', marginTop: '12px', fontSize: '0.9rem' }}>{error}</div>}
      </div>

      <div ref={reportRef} className={styles.printArea}>
        {/* Title for Print Only */}
        <div style={{ display: 'none' }} className="print-title">
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Laporan Penjualan Detail</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#64748b' }}>
            Periode: {startDate} s/d {endDate}
          </p>
        </div>

        {reportData ? (
          reportData.transactions.length > 0 ? (
            <>
              {/* Summary Box */}
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Total Transaksi</div>
                  <div className={`${styles.summaryValue} ${styles.green}`}>
                    {reportData.summary.totalTransactions}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Produk Terjual</div>
                  <div className={styles.summaryValue}>
                    {reportData.summary.productsSold}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Total Modal (HPP)</div>
                  <div className={`${styles.summaryValue} ${styles.orange}`}>
                    Rp {reportData.summary.totalHPP.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Total Penjualan</div>
                  <div className={styles.summaryValue}>
                    Rp {reportData.summary.totalSubtotal.toLocaleString('id-ID')}
                  </div>
                </div>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryLabel}>Laba</div>
                  <div className={`${styles.summaryValue} ${styles.green}`}>
                    Rp {reportData.summary.grossProfit.toLocaleString('id-ID')}
                  </div>
                </div>

              </div>

              <div className={styles.tablesContainer}>
                {/* Tabel Daftar Transaksi Lunas */}
                <div className={styles.tableSection}>
                  <h3 className={styles.sectionTitle}>Daftar Transaksi Lunas</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>ID Pesanan</th>
                        <th>Waktu</th>
                        <th>Kasir</th>
                        <th>Total Bayar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td style={{ fontWeight: 600 }}>{tx.invoice_number}</td>
                          <td>{new Date(tx.created_at.includes('Z') ? tx.created_at : tx.created_at + 'Z').toLocaleString('id-ID')}</td>
                          <td>{tx.cashier_name}</td>
                          <td style={{ fontWeight: 600 }}>Rp {tx.total_amount.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Tabel Detail Menu Terjual */}
                <div className={styles.tableSection}>
                  <h3 className={styles.sectionTitle}>Detail Menu Terjual</h3>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Menu</th>
                        <th>Qty Terjual</th>
                        <th>Harga Jual</th>
                        <th>Total Jual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.itemDetails.map((item, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 500 }}>{item.name}</td>
                          <td>{item.qty}</td>
                          <td>Rp {item.sellingPrice.toLocaleString('id-ID')}</td>
                          <td style={{ color: '#10B981', fontWeight: 600 }}>Rp {item.totalSales.toLocaleString('id-ID')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Tidak ada data penjualan</h3>
              <p>Belum ada transaksi pada rentang tanggal yang dipilih.</p>
            </div>
          )
        ) : (
          <div className={styles.emptyState}>
            <Calendar size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-main)' }}>Pilih Tanggal Laporan</h3>
            <p>Silakan pilih rentang tanggal dan klik "Filter Laporan" untuk menampilkan data.</p>
          </div>
        )}
      </div>
      
      {/* Global styles for print title */}
      <style jsx global>{`
        @media print {
          .print-title {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}
