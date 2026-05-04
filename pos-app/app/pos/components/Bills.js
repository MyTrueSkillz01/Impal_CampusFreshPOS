'use client';

import { useState, useEffect } from 'react';
import { Receipt, X, MapPin, Phone, FileText, User } from 'lucide-react';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);

  useEffect(() => {
    fetch('/api/transactions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBills(data);
        }
      })
      .catch((err) => console.error('Error fetching bills:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: '24px' }}>Memuat data transaksi...</div>;
  }

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto', position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Transaksi Harian (Bills)</h1>
          <p style={{ color: 'var(--text-muted)' }}>Daftar pesanan yang sudah selesai pada hari ini</p>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Invoice</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID Pesanan</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Waktu Transaksi</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nama Pelanggan</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Item Terjual</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Total Bayar</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => {
              let items = [];
              let customerInfo = null;
              try {
                items = JSON.parse(bill.items);
                if (bill.customer_info) {
                  customerInfo = JSON.parse(bill.customer_info);
                }
              } catch (e) { }

              const timeString = new Date(bill.created_at).toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit'
              });

              const itemSummary = items.map(i => `${i.qty}x ${i.name}`).join(', ');
              const customerName = customerInfo?.nama || 'Pelanggan Umum';

              return (
                <tr key={bill.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#3B82F6',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                      onClick={() => setSelectedBill({ ...bill, items, customerInfo })}
                    >
                      {bill.invoice_number}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#64748B' }}>#{bill.id} (No: {bill.daily_number})</td>
                  <td style={{ padding: '16px' }}>{timeString} WIB</td>
                  <td style={{ padding: '16px', color: '#64748B', fontWeight: 500 }}>{customerName}</td>
                  <td style={{ padding: '16px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={itemSummary}>
                    {itemSummary}
                  </td>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#10B981' }}>Rp {bill.total_amount.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}

            {bills.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: '40px 24px', textAlign: 'center', color: '#94A3B8' }}>
                  <Receipt size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
                  <div style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Belum ada transaksi hari ini</div>
                  <div>Transaksi yang selesai akan muncul di sini.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL UNTUK DETAIL INVOICE */}
      {selectedBill && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex',
          alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px',
            maxHeight: '90vh', overflowY: 'auto', display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Detail Invoice: <span style={{ color: '#DC2626' }}>{selectedBill.invoice_number}</span></h2>
              <button onClick={() => setSelectedBill(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Informasi Pelanggan */}
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <User size={18} /> Informasi Pelanggan
                </h3>
                {selectedBill.customerInfo ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.95rem' }}>
                    <div><span style={{ color: '#64748B' }}>Nama:</span> <br /> <strong>{selectedBill.customerInfo.nama || '-'}</strong></div>
                    <div><span style={{ color: '#64748B' }}>NIM:</span> <br /> <strong>{selectedBill.customerInfo.nim || '-'}</strong></div>
                    <div><span style={{ color: '#64748B' }}><Phone size={14} style={{ display: 'inline', marginRight: '4px' }} />No Telepon:</span> <br /> <strong>{selectedBill.customerInfo.noTelfon || '-'}</strong></div>
                    <div><span style={{ color: '#64748B' }}><FileText size={14} style={{ display: 'inline', marginRight: '4px' }} />Catatan:</span> <br /> <strong>{selectedBill.customerInfo.catatan || '-'}</strong></div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <span style={{ color: '#64748B' }}><MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} />Alamat:</span> <br />
                      <strong>{selectedBill.customerInfo.alamat || '-'}</strong>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#94A3B8', fontSize: '0.9rem' }}>Tidak ada data pelanggan untuk transaksi ini.</p>
                )}
              </div>

              {/* Rincian Pesanan */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: '#334155' }}>Rincian Item</h3>
                <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                  {selectedBill.items.map((item, idx) => (
                    <div key={idx} style={{ padding: '12px 16px', borderBottom: idx !== selectedBill.items.length - 1 ? '1px solid #E2E8F0' : 'none', display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 500 }}>{item.name}</div>
                        <div style={{ color: '#64748B', fontSize: '0.85rem' }}>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div>
                      </div>
                      <div style={{ fontWeight: 600 }}>Rp {(item.qty * item.price).toLocaleString('id-ID')}</div>
                    </div>
                  ))}
                  <div style={{ padding: '16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    <span>Total Bayar</span>
                    <span style={{ color: '#10B981' }}>Rp {selectedBill.total_amount.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              {/* Bukti Foto Pembayaran */}
              {selectedBill.customerInfo?.paymentProof && (
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '12px', color: '#334155' }}>Bukti Foto Pembayaran</h3>
                  <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0', background: '#F1F5F9', textAlign: 'center' }}>
                    <img src={selectedBill.customerInfo.paymentProof} alt="Bukti Pembayaran" style={{ maxWidth: '100%', height: 'auto', display: 'block', margin: '0 auto' }} />
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
