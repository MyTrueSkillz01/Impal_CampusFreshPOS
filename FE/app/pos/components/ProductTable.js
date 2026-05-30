'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit2, MessageCircle, Trash2 } from 'lucide-react';
import styles from '../pos.module.css';

export default function ProductTable() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [productToDelete, setProductToDelete] = useState(null);

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

  const confirmDelete = (id) => {
    setProductToDelete(id);
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        const res = await fetch(`/api/products/${productToDelete}`, { method: 'DELETE' });
        if (res.ok) {
          setToastMessage('Produk berhasil dihapus!');
          setTimeout(() => setToastMessage(''), 3000);
          fetchProducts();
        } else {
          alert('Gagal menghapus produk');
        }
      } catch (error) {
        console.error('Failed to delete product', error);
      } finally {
        setProductToDelete(null);
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        setEditingProduct(null);
        setToastMessage('Produk berhasil diperbarui!');
        setTimeout(() => setToastMessage(''), 3000);
        fetchProducts();
      } else {
        const err = await res.json();
        alert('Gagal mengedit: ' + err.error);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan saat mengedit');
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
                      onClick={() => setEditingProduct(product)}
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', cursor: 'pointer', border: 'none' }}
                      title="Hapus Produk"
                      onClick={() => confirmDelete(product.id)}
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

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '24px' }}>Edit Produk</h2>
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kode Produk</label>
                  <input type="text" name="product_code" value={editingProduct.product_code} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Nama Produk</label>
                  <input type="text" name="name" value={editingProduct.name} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Kategori</label>
                  <input type="text" name="category" value={editingProduct.category} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Stok</label>
                  <input type="number" name="stock" value={editingProduct.stock} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Harga Modal</label>
                  <input type="number" name="cost_price" value={editingProduct.cost_price} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>Harga Jual</label>
                  <input type="number" name="selling_price" value={editingProduct.selling_price} onChange={handleEditChange} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>URL Foto Produk</label>
                  <input type="text" name="image_url" value={editingProduct.image_url} onChange={handleEditChange} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontWeight: 600, fontSize: '0.9rem' }}>No WhatsApp Penjual</label>
                  <input type="text" name="seller_phone" value={editingProduct.seller_phone || ''} onChange={handleEditChange} placeholder="Contoh: 6281234567890" style={{ padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', width: '100%' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setEditingProduct(null)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', background: 'transparent', cursor: 'pointer', fontWeight: 'bold', color: '#475569' }}>
                  Batal
                </button>
                <button type="submit" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', background: '#3B82F6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#10B981', color: 'white', padding: '16px 24px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontWeight: 'bold', zIndex: 1001, animation: 'fadeIn 0.3s ease' }}>
          {toastMessage}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, animation: 'fadeIn 0.2s ease', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'white', padding: '32px', borderRadius: '16px', width: '100%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ width: '80px', height: '80px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', marginBottom: '24px' }}>
              <Trash2 size={40} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1E293B', marginBottom: '12px' }}>Hapus Produk?</h2>
            <p style={{ color: '#64748B', marginBottom: '32px', lineHeight: '1.5' }}>
              Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <button 
                onClick={() => setProductToDelete(null)}
                style={{ flex: 1, padding: '12px', background: '#F1F5F9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                style={{ flex: 1, padding: '12px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' }}
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
