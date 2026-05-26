'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, ArrowLeft, CheckCircle, CreditCard, Camera } from 'lucide-react';
import styles from './checkout.module.css';

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    nama: '',
    nim: '',
    noTelfon: '',
    alamat: '',
    catatan: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const savedCart = localStorage.getItem('pos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch(e) {}
    } else {
      router.push('/pos');
    }
  }, [router]);

  useEffect(() => {
    if (isCameraOpen && !capturedPhoto) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera access denied:", err);
          alert("Gagal mengakses kamera. Berikan izin akses kamera pada browser.");
        });
    }
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, capturedPhoto]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      const dataUrl = canvasRef.current.toDataURL('image/jpeg');
      setCapturedPhoto(dataUrl);
    }
  };

  const retakePhoto = () => {
    setCapturedPhoto(null);
  };

  const finishUpload = async () => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart: cart,
          totalAmount: totalPrice,
          customerInfo: {
            ...formData,
            paymentProof: capturedPhoto
          }
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        alert(errJson.error || 'Gagal menyimpan transaksi');
        return; // Stop execution if failed
      }
    } catch (e) {
      console.error('Error saving transaction:', e);
      alert('Terjadi kesalahan saat memproses transaksi');
      return; // Stop execution if failed
    }

    setIsCameraOpen(false);
    setIsSuccess(true);
    localStorage.removeItem('pos_cart');
    
    // Return to POS after 2.5 seconds
    setTimeout(() => {
      router.push('/pos');
    }, 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    // Buka antarmuka kamera sebelum success
    setIsCameraOpen(true);
  };

  if (isCameraOpen) {
    return (
      <div className={styles.container}>
        <div className={styles.card} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px', maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Camera size={28} color="#3B82F6" />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Foto Bukti Pembayaran</h2>
          </div>
          
          {!capturedPhoto ? (
            <>
              <div style={{ width: '100%', height: '350px', background: '#000', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
              </div>
              <button 
                onClick={capturePhoto}
                style={{ marginTop: '24px', padding: '14px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
              >
                Ambil Foto
              </button>
              <button 
                onClick={() => setIsCameraOpen(false)}
                style={{ marginTop: '12px', padding: '12px 24px', background: 'transparent', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
              >
                Batal
              </button>
            </>
          ) : (
            <>
              <div style={{ width: '100%', borderRadius: '12px', overflow: 'hidden', border: '4px solid #E2E8F0' }}>
                <img src={capturedPhoto} alt="Captured Bukti Pembayaran" style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '24px' }}>
                <button 
                  onClick={retakePhoto}
                  style={{ flex: 1, padding: '14px', background: 'white', color: '#475569', border: '1px solid #CBD5E1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Ulangi Foto
                </button>
                <button 
                  onClick={finishUpload}
                  style={{ flex: 1, padding: '14px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  Upload & Selesai
                </button>
              </div>
            </>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div style={{ width: '80px', height: '80px', background: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: '24px' }}>
            <CheckCircle size={48} color="#10B981" />
          </div>
          <h2 className={styles.title} style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Tagihan Dibuat!</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            Transaksi untuk {formData.nama || 'Pelanggan'} telah berhasil dicatat.
          </p>
          <p style={{ color: 'var(--text-muted)', marginTop: '24px', fontSize: '0.9rem' }}>
            Mengalihkan kembali ke kasir...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.header}>
            <FileText size={28} color="#DC2626" />
            <h1 className={styles.title}>Data Pelanggan</h1>
          </div>
          <form id="checkout-form" onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label>Nama Lengkap</label>
              <input 
                type="text" 
                name="nama"
                className="input-field" 
                placeholder="Masukkan nama pembeli" 
                required 
                value={formData.nama}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>NIM (Nomor Induk Mahasiswa)</label>
              <input 
                type="text" 
                name="nim"
                className="input-field" 
                placeholder="Masukkan NIM pembeli" 
                required 
                value={formData.nim}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Nomer Telfon</label>
              <input 
                type="tel" 
                name="noTelfon"
                className="input-field" 
                placeholder="Misal: 081234567890" 
                required 
                value={formData.noTelfon}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Alamat</label>
              <textarea 
                name="alamat"
                className="input-field" 
                placeholder="Masukkan alamat lengkap atau asal fakultas/prodi" 
                required
                value={formData.alamat}
                onChange={handleChange}
              ></textarea>
            </div>
            <div className={styles.formGroup}>
              <label>Catatan Pesanan (Opsional)</label>
              <textarea 
                name="catatan"
                className="input-field" 
                placeholder="Keterangan tambahan untuk pesanan ini..."
                value={formData.catatan}
                onChange={handleChange}
              ></textarea>
            </div>
          </form>
        </div>

        {/* Order Summary Section */}
        <div className={styles.orderSection}>
          <div className={styles.header}>
            <h2 className={styles.title} style={{ fontSize: '1.25rem' }}>Ringkasan Pesanan</h2>
            <span style={{ marginLeft: 'auto', background: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontSize: '0.85rem', color: 'white' }}>
              {cart.length} Item
            </span>
          </div>
          
          <div className={styles.orderItems}>
            {cart.map((item) => (
              <div key={item.id} className={styles.orderItem}>
                <div>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemQty}>{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div>
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                  Rp {(item.price * item.qty).toLocaleString('id-ID')}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <div className={styles.summaryRow}>
              <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
            <div className={styles.summaryRow}>
              <span style={{ color: 'var(--text-muted)' }}>Pajak (0%)</span>
              <span>Rp 0</span>
            </div>
            <div className={`${styles.summaryRow} ${styles.totalRow}`}>
              <span>Total Tagihan</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>

            <button 
              type="submit" 
              form="checkout-form"
              className={`btn-primary ${styles.btnSubmit}`}
            >
              <CreditCard size={20} />
              Konfirmasi & Buat Tagihan
            </button>
            <button 
              type="button" 
              className={styles.btnBack}
              onClick={() => router.push('/pos')}
            >
              <ArrowLeft size={18} />
              Kembali
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
