'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import styles from '../pos.module.css'; // Reuse POS styles for basic layout config if needed

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_code: '',
    name: '',
    category: '',
    image_url: 'https://via.placeholder.com/150', // Default placeholder
    cost_price: 0,
    selling_price: 0,
    stock: 0,
    is_active: true,
    seller_phone: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to add product');
      }
      alert('Produk berhasil ditambahkan!');
      router.push('/pos');
    } catch (error) {
      alert(`Gagal menambah produk: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', padding: '40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        
        {/* Header */}
        <div style={{ padding: '24px 32px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={() => router.back()}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', color: '#64748B' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B', margin: 0 }}>Tambah Produk Baru</h1>
            <p style={{ color: '#64748B', margin: 0, fontSize: '0.9rem' }}>Masukkan detail produk untuk ditambahkan ke sistem</p>
          </div>
        </div>

        {/* Form Body */}
        <div style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>ID Produk</label>
                <input required type="text" name="product_code" value={formData.product_code} onChange={handleChange} placeholder="Contoh: P005" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Nama Produk</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Contoh: Topi Kampus" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Kategori</label>
                <input required type="text" name="category" value={formData.category} onChange={handleChange} placeholder="Contoh: Atribut" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>URL Gambar</label>
                <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} placeholder="https://..." style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Stok Awal</label>
                <input required type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Harga Modal (HPP)</label>
                <input required type="number" min="0" name="cost_price" value={formData.cost_price} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Harga Jual</label>
                <input required type="number" min="0" name="selling_price" value={formData.selling_price} onChange={handleChange} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>No. WA Penjual (Opsional)</label>
                <input type="text" name="seller_phone" value={formData.seller_phone} onChange={handleChange} placeholder="Contoh: 62812345678" style={{ padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', outline: 'none' }} />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label htmlFor="is_active" style={{ fontSize: '1rem', fontWeight: 500, color: '#334155', cursor: 'pointer' }}>Status Produk Aktif</label>
              </div>

            </div>

            <div style={{ marginTop: '40px', borderTop: '1px solid #E2E8F0', paddingTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                type="button"
                onClick={() => router.back()}
                style={{ padding: '12px 24px', borderRadius: '8px', background: 'white', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={loading}
                style={{ padding: '12px 24px', borderRadius: '8px', background: '#DC2626', border: 'none', color: 'white', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
              >
                <Save size={20} />
                {loading ? 'Menyimpan...' : 'Simpan Produk'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
