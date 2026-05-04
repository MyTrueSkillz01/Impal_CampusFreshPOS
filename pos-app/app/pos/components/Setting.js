'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, AlertTriangle } from 'lucide-react';
import styles from './Setting.module.css';

export default function Setting() {
  const [cashiers, setCashiers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    username: '',
    password: '',
    role: 'Kasir',
    status: 'Aktif'
  });

  useEffect(() => {
    fetchCashiers();
  }, []);

  const fetchCashiers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/cashiers');
      if (!res.ok) throw new Error('Gagal memuat data kasir');
      const data = await res.json();
      setCashiers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (cashier = null) => {
    if (cashier) {
      setFormData({
        id: cashier.id,
        name: cashier.name,
        username: cashier.username,
        password: '', // Don't show base64 in edit input, leave blank to keep unchanged
        role: cashier.role || 'Kasir',
        status: cashier.status || 'Aktif'
      });
    } else {
      setFormData({
        id: null,
        name: '',
        username: '',
        password: '',
        role: 'Kasir',
        status: 'Aktif'
      });
    }
    setError('');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCashier(null);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.role) {
      setError('Harap lengkapi semua field yang wajib.');
      return;
    }
    
    // Password is required for new users
    if (!formData.id && !formData.password) {
      setError('Password wajib diisi untuk karyawan baru.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      const isEdit = !!formData.id;
      const url = isEdit ? `/api/cashiers/${formData.id}` : '/api/cashiers';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menyimpan data');

      await fetchCashiers();
      handleCloseModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = (cashier) => {
    setSelectedCashier(cashier);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCashier) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/cashiers/${selectedCashier.id}`, {
        method: 'DELETE'
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Gagal menghapus data');

      await fetchCashiers();
      setIsDeleteModalOpen(false);
      setSelectedCashier(null);
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Helper to decode base64 password for display
  const decodePassword = (encoded) => {
    if (!encoded) return '';
    try {
      // Check if it's base64 (very basic check)
      if (encoded.length % 4 === 0 && /^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) {
        return atob(encoded);
      }
      return encoded; // Return as is if not encoded (old seed data)
    } catch (e) {
      return encoded;
    }
  };

  if (isLoading && cashiers.length === 0) {
    return <div style={{ padding: '24px' }}>Memuat data...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Setting / Manajemen Kasir</h1>
          <p style={{ color: 'var(--text-muted)' }}>Kelola data karyawan dan akses sistem kasir</p>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnAdd} onClick={() => handleOpenModal()}>
            <Plus size={20} />
            Tambah Karyawan
          </button>
        </div>
      </div>

      <div className={styles.tableSection}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Karyawan</th>
              <th>Username</th>
              <th>Password</th>
              <th>Role</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cashiers.map((cashier, index) => (
              <tr key={cashier.id}>
                <td>#{index + 1}</td>
                <td style={{ fontWeight: 600 }}>{cashier.name}</td>
                <td>{cashier.username}</td>
                <td>
                  <div className={styles.pwCell}>
                    <span style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: visiblePasswords[cashier.id] ? '0' : '2px' }}>
                      {visiblePasswords[cashier.id] ? decodePassword(cashier.password) : '********'}
                    </span>
                    <button 
                      className={styles.btnTogglePw} 
                      onClick={() => togglePasswordVisibility(cashier.id)}
                      title={visiblePasswords[cashier.id] ? "Sembunyikan" : "Tampilkan"}
                    >
                      {visiblePasswords[cashier.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </td>
                <td>
                  <span className={`${styles.badge} ${cashier.role?.toLowerCase() === 'admin' ? styles.admin : styles.kasir}`}>
                    {cashier.role || 'Kasir'}
                  </span>
                </td>
                <td>
                  <span className={`${styles.badge} ${cashier.status === 'Aktif' ? styles.aktif : styles.nonaktif}`}>
                    {cashier.status || 'Aktif'}
                  </span>
                </td>
                <td>
                  <div className={styles.actionCell}>
                    <button className={styles.btnEdit} onClick={() => handleOpenModal(cashier)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className={styles.btnDelete} onClick={() => confirmDelete(cashier)} title="Hapus">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {cashiers.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  Belum ada data kasir.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Tambah/Edit */}
      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{formData.id ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
              <button className={styles.btnClose} onClick={handleCloseModal}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave}>
              <div className={styles.modalBody}>
                {error && <div style={{ padding: '12px', background: '#FEE2E2', color: '#DC2626', borderRadius: '8px', fontSize: '0.9rem' }}>{error}</div>}
                
                <div className={styles.formGroup}>
                  <label>Nama Lengkap</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Username / Login</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                    placeholder="username_login"
                    required
                  />
                </div>
                
                <div className={styles.formGroup}>
                  <label>Password</label>
                  <input 
                    type="password" 
                    className={styles.input} 
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    placeholder={formData.id ? "(Kosongkan jika tidak ingin mengubah password)" : "Masukkan password baru"}
                    required={!formData.id}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select 
                      className={styles.input}
                      value={formData.role}
                      onChange={e => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="Kasir">Kasir</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select 
                      className={styles.input}
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Nonaktif">Nonaktif</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className={styles.modalFooter}>
                <button type="button" className={styles.btnCancel} onClick={handleCloseModal}>
                  Batal
                </button>
                <button type="submit" className={styles.btnSubmit} disabled={isSaving}>
                  {isSaving ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent} style={{ maxWidth: '400px' }}>
            <div className={styles.modalBody} style={{ textAlign: 'center', paddingTop: '32px' }}>
              <div style={{ width: '64px', height: '64px', background: '#FEE2E2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', color: '#EF4444' }}>
                <AlertTriangle size={32} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginTop: '16px', marginBottom: '8px' }}>Hapus Karyawan?</h2>
              <p style={{ color: 'var(--text-muted)' }}>
                Apakah Anda yakin ingin menghapus akun <strong>{selectedCashier?.name}</strong>? Tindakan ini tidak dapat dibatalkan, namun data transaksinya akan tetap aman.
              </p>
            </div>
            <div className={styles.modalFooter} style={{ justifyContent: 'center', gap: '16px' }}>
              <button className={styles.btnCancel} onClick={() => setIsDeleteModalOpen(false)}>
                Batal
              </button>
              <button className={`${styles.btnSubmit} ${styles.danger}`} onClick={handleDelete} disabled={isSaving}>
                {isSaving ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
