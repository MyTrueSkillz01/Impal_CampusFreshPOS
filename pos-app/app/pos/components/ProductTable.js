'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, MessageCircle, Trash2 } from 'lucide-react';
import styles from '../pos.module.css';

export default function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    }
  };

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading data produk...</div>;
  }

  return (
    <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '8px' }}>Daftar Produk</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manajemen data produk, stok, dan harga</p>
        </div>
        <button 
          className="btn-primary" 
          onClick={() => router.push('/pos/add-product')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
            <tr>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>ID Produk</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Gambar</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Nama Produk</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Kategori</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Harga Modal</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Harga Jual</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Stok</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '16px', fontWeight: 600, color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.2s' }}>
                <td style={{ padding: '16px', color: '#64748B' }}>{product.product_code}</td>
                <td style={{ padding: '16px' }}>
                  <img src={product.image_url || '/logo.png'} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                </td>
                <td style={{ padding: '16px', fontWeight: 500 }}>{product.name}</td>
                <td style={{ padding: '16px', color: '#64748B' }}>{product.category}</td>
                <td style={{ padding: '16px' }}>Rp {product.cost_price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '16px', fontWeight: 500, color: '#10B981' }}>Rp {product.selling_price.toLocaleString('id-ID')}</td>
                <td style={{ padding: '16px', fontWeight: 500 }}>{product.stock}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '20px', 
                    fontSize: '0.8rem', 
                    fontWeight: 600,
                    background: product.is_active ? '#D1FAE5' : '#FEE2E2',
                    color: product.is_active ? '#059669' : '#DC2626'
                  }}>
                    {product.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {product.seller_phone && (
                      <a 
                        href={`https://wa.me/${product.seller_phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#DCFCE7', color: '#16A34A', cursor: 'pointer' }}
                        title="Chat Penjual"
                      >
                        <MessageCircle size={18} />
                      </a>
                    )}
                    <button 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#F3F4F6', color: '#4B5563', cursor: 'pointer', border: 'none' }}
                      title="Edit Produk"
                      onClick={() => alert('Fitur Edit belum diimplementasikan di MVP')}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', border: 'none' }}
                      title="Hapus Produk"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#94A3B8' }}>
                  Belum ada produk yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
