'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, ShoppingCart, Trash2, CreditCard, Package } from 'lucide-react';
import styles from './pos.module.css';
import ProductTable from './components/ProductTable';
import Bills from './components/Bills';
import Settlement from './components/Settlement';
import Report from './components/Report';
import Setting from './components/Setting';

const MENU_ITEMS = [
  'Daftar Menu', 'Daftar Produk', 'Bills', 'Settlement', 'Report', 'Setting'
];

export default function PosPage() {
  const router = useRouter();
  const [cart, setCart] = useState([]);
  const [activeMenu, setActiveMenu] = useState('Daftar Menu');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('pos_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {}
    }
    
    // Fetch products
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          // Hanya ambil produk yang aktif (is_active === 1)
          setProducts(data.filter(p => p.is_active));
        }
      })
      .catch(err => console.error('Error fetching products', err));
  }, []);
  
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      })
    );
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  const totalPrice = cart.reduce((acc, item) => acc + item.selling_price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    localStorage.setItem('pos_cart', JSON.stringify(cart));
    router.push('/checkout');
  };

  return (
    <div className={styles.layout}>
      {/* Left Navigation Sidebar */}
      <div className={styles.navSidebar}>
         <div className={styles.logoContainer}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
               <img src="/logo.png" alt="Logo PKKMB" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
            </div>
            <span className={styles.logoText} style={{ color: '#DC2626' }}>Campus<span style={{ color: '#FACC15' }}>Fresh</span>POS</span>
         </div>
         <div className={styles.navMenu}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</div>
            {MENU_ITEMS.map((menu) => (
              <div 
                key={menu} 
                className={`${styles.menuItem} ${activeMenu === menu ? styles.active : ''}`}
                onClick={() => setActiveMenu(menu)}
              >
                {menu}
              </div>
            ))}
         </div>
         <div className={styles.navFooter}>
            <div className={styles.menuItem} style={{ color: '#DC2626', fontWeight: 600 }} onClick={handleLogout} onMouseEnter={(e) => e.currentTarget.style.color = 'white'} onMouseLeave={(e) => e.currentTarget.style.color = '#DC2626'}>
              Logout
            </div>
         </div>
      </div>

      {/* Main Content (Products or Table) */}
      {activeMenu === 'Daftar Produk' ? (
        <ProductTable />
      ) : activeMenu === 'Bills' ? (
        <Bills />
      ) : activeMenu === 'Settlement' ? (
        <Settlement />
      ) : activeMenu === 'Report' ? (
        <Report />
      ) : activeMenu === 'Setting' ? (
        <Setting />
      ) : (
        <div className={styles.mainContent}>
          <div className={styles.header}>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontSize: '2rem', marginBottom: '8px' }}>Peralatan PKKMB & Kuliah</h1>
              <p style={{ color: 'var(--text-muted)' }}>Pilih perlengkapan mahasiswa baru untuk ditambahkan ke order</p>
            </div>
          </div>

          <div className={styles.productGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard} onClick={() => addToCart({ ...product, price: product.selling_price })}>
                <img src={product.image_url || '/logo.png'} alt={product.name} className={styles.productImage} />
                <h3 className={styles.productTitle}>{product.name}</h3>
                <div className={styles.productPrice}>Rp {product.selling_price.toLocaleString('id-ID')}</div>
                <button className={styles.addBtn}>+ ADD</button>
              </div>
            ))}
            {products.length === 0 && (
              <div style={{ padding: '24px', color: '#94A3B8' }}>Belum ada produk aktif yang tersedia.</div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar (Cart) */}
      {activeMenu === 'Daftar Menu' && (
        <div className={styles.sidebar}>
          <div className={styles.cartHeader}>
          <h2 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} />
            Order List
          </h2>
          <span style={{ background: 'var(--primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.85rem' }}>
            {cart.length} item
          </span>
        </div>

        <div className={styles.cartItems}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '40px' }}>
              <ShoppingCart size={48} style={{ margin: '0 auto', opacity: 0.2, marginBottom: '16px' }} />
              <p>Order masih kosong</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.cartDetails}>
                  <h4>{item.name}</h4>
                  <div style={{ color: '#10B981', fontSize: '0.9rem' }}>Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
                </div>
                <div className={styles.cartActions}>
                  <button className={styles.btnAction} onClick={() => updateQty(item.id, -1)}>-</button>
                  <span>{item.qty}</span>
                  <button className={styles.btnAction} onClick={() => updateQty(item.id, 1)}>+</button>
                  <button className={styles.btnAction} style={{ background: 'rgba(239, 68, 68, 0.2)', color: 'var(--error)' }} onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.cartFooter}>
          <div className={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
            <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <div className={styles.summaryRow}>
            <span style={{ color: 'var(--text-muted)' }}>Pajak (0%)</span>
            <span>Rp 0</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.totalRow}`}>
            <span>Total</span>
            <span style={{ color: '#10B981' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
          </div>
          <button 
            className={`btn-primary ${styles.checkoutBtn}`} 
            onClick={handleCheckout}
            disabled={cart.length === 0}
          >
            <CreditCard size={20} />
            Buat Tagihan
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
