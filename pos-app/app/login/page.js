'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Store, LogIn } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push('/pos');
      } else {
        setError(data.error || 'Login gagal, periksa nama pengguna dan kata sandi');
      }
    } catch (err) {
      setError('Terjadi kesalahan koneksi server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={`glass animate-fade-in ${styles.loginCard}`}>
        <div style={{ marginBottom: '16px' }}>
          <img src="/logo.png" alt="Logo PKKMB" style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
        </div>
        <h1 className={styles.title} style={{ color: '#DC2626' }}>Campus<span style={{ color: '#FACC15' }}>Fresh</span>POS</h1>
        <p className={styles.subtitle}>Selamat datang! Silakan login untuk operasional persiapan PKKMB.</p>

        {error && <div className="alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              required
              className="input-field"
              placeholder="Masukkan username kasir"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Kata Sandi</label>
            <input
              id="password"
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className={`btn-primary ${styles.submitBtn}`} disabled={loading}>
            {loading ? 'Memeriksa...' : (
              <>
                <LogIn size={20} />
                Masuk
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
