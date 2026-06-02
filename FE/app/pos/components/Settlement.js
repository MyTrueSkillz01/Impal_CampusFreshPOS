'use client';

import { useState, useEffect } from 'react';
import { Lock, Unlock, CheckCircle, AlertTriangle, X } from 'lucide-react';
import styles from './Settlement.module.css';

export default function Settlement() {
  const [data, setData] = useState({
    isOpen: true,
    totalTransactions: 0,
    totalRevenue: 0,
    itemDetails: []
  });
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null });
  const [notification, setNotification] = useState(null);

  const showToast = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(prev => (prev && prev.message === message ? null : prev));
    }, 3000);
  };

  const fetchSettlementData = async () => {
    try {
      const res = await fetch('/api/settlement');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setData(json);
    } catch (err) {
      console.error(err);
      showToast('error', 'Gagal mengambil data settlement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlementData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const triggerStoreStatusConfirm = (action) => {
    setConfirmModal({ isOpen: true, action });
  };

  const executeStoreStatus = async () => {
    const action = confirmModal.action;
    setConfirmModal({ isOpen: false, action: null });
    
    try {
      setLoading(true);
      const res = await fetch('/api/settlement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const result = await res.json();
      
      if (!res.ok) throw new Error(result.error);
      
      // Refresh data
      await fetchSettlementData();
      showToast('success', `Kasir berhasil ${action === 'close' ? 'ditutup' : 'dibuka'}.`);
    } catch (err) {
      console.error(err);
      showToast('error', err.message || 'Terjadi kesalahan');
      setLoading(false);
    }
  };

  // Format today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  if (loading && !data.itemDetails) {
    return <div className={styles.container}>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settlement (Tutup Kasir)</h2>
        <button className={styles.printBtn} onClick={handlePrint}>Print Report</button>
      </div>

      <div className={styles.topCards}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Tanggal</div>
          <div className={styles.dateValue}>{formattedDate}</div>
        </div>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Total Transaksi Lunas</div>
          <div className={styles.txValue}>{data.totalTransactions}</div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <div className={styles.cardLabel}>Detail Menu Terjual Hari Ini</div>
          <div className={styles.tableContainer}>
            <table className={styles.detailTable}>
              <thead>
                <tr>
                  <th>MENU</th>
                  <th style={{ textAlign: 'center' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {data.itemDetails.length === 0 ? (
                  <tr>
                    <td colSpan="3">
                      <div className={styles.emptyState}>
                        Belum ada menu terjual hari ini.
                      </div>
                    </td>
                  </tr>
                ) : (
                  data.itemDetails.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.qty}</td>
                      <td style={{ textAlign: 'right' }}>Rp {item.total.toLocaleString('id-ID')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardLabel}>Ringkasan Keuangan</div>
          
          <div className={styles.summaryRow}>
            <span>Subtotal Penjualan</span>
            <span>Rp {data.totalRevenue.toLocaleString('id-ID')}</span>
          </div>
          
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Total Pendapatan</span>
            <span>Rp {data.totalRevenue.toLocaleString('id-ID')}</span>
          </div>

          <div className={styles.actionContainer}>
            <button 
              className={`${styles.actionBtn} ${!data.isOpen ? styles.disabledBtn : styles.closeBtn}`}
              onClick={() => triggerStoreStatusConfirm('close')}
              disabled={!data.isOpen || loading}
            >
              Tutup Kasir
            </button>
            <button 
              className={`${styles.actionBtn} ${data.isOpen ? styles.disabledBtn : styles.openBtn}`}
              onClick={() => triggerStoreStatusConfirm('open')}
              disabled={data.isOpen || loading}
            >
              Buka Kasir
            </button>
          </div>
          
          {!data.isOpen && (
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#DC2626', textAlign: 'center' }}>
              Status: Kasir Ditutup (Transaksi tidak dapat dilakukan)
            </div>
          )}
          {data.isOpen && (
            <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#10B981', textAlign: 'center' }}>
              Status: Kasir Dibuka (Transaksi dapat dilakukan)
            </div>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className={styles.modalOverlay} onClick={() => setConfirmModal({ isOpen: false, action: null })}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalBody}>
              <div className={`${styles.iconContainer} ${confirmModal.action === 'close' ? styles.iconClose : styles.iconOpen}`}>
                {confirmModal.action === 'close' ? <Lock size={32} /> : <Unlock size={32} />}
              </div>
              <h3 className={styles.modalTitle}>
                {confirmModal.action === 'close' ? 'Tutup Kasir?' : 'Buka Kasir?'}
              </h3>
              <p className={styles.modalText}>
                {confirmModal.action === 'close' 
                  ? 'Apakah Anda yakin ingin menutup kasir? Transaksi penjualan baru tidak akan dapat diproses sampai kasir dibuka kembali.'
                  : 'Apakah Anda yakin ingin membuka kasir? Transaksi penjualan baru akan dapat mulai dilakukan.'
                }
              </p>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.btnCancel} 
                onClick={() => setConfirmModal({ isOpen: false, action: null })}
              >
                Batal
              </button>
              <button 
                className={`${styles.btnSubmit} ${confirmModal.action === 'close' ? styles.btnDanger : styles.btnSuccess}`}
                onClick={executeStoreStatus}
              >
                {confirmModal.action === 'close' ? 'Ya, Tutup Kasir' : 'Ya, Buka Kasir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Toast Notification */}
      {notification && (
        <div 
          className={`${styles.toast} ${notification.type === 'success' ? styles.toastSuccess : styles.toastError}`}
          onClick={() => setNotification(null)}
        >
          <div className={styles.toastIcon}>
            {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          </div>
          <div className={styles.toastMessage}>{notification.message}</div>
          <button className={styles.toastCloseBtn}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
