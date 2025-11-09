// src/App.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { products } from './data/products';
import SearchBar from './components/SearchBar';
import ProductList from './components/ProductList';
import { lazy, Suspense } from 'react';
import { getFromCache, setToCache } from './utils/searchCache';


const AboutPage = lazy(() => import('./components/AboutPage'));

// Helper: simpan ke localStorage
const saveCartToStorage = (cart) => {
  localStorage.setItem('pos-cart', JSON.stringify(cart));
};

// Helper: baca dari localStorage
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('pos-cart');
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.warn('Gagal memuat keranjang dari localStorage');
    return [];
  }
};

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState(() => loadCartFromStorage()); // inisialisasi dari storage
  const [view, setView] = useState('pos'); // 'pos' atau 'about'

  // Simpan ke localStorage setiap cart berubah
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Filter produk (optimalkan dengan useMemo)
  const filteredProducts = useMemo(() => {
  if (!searchTerm.trim()) return products;

  const cached = getFromCache(searchTerm);
  if (cached) {
    console.log('✅ Mengambil dari cache:', searchTerm);
    return cached;
  }

  console.log('🔍 Filter data baru:', searchTerm);
  const term = searchTerm.toLowerCase();
  const result = products.filter(
    (p) =>
      p.name.toLowerCase().includes(term) ||
      p.brand.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term)
  );

  setToCache(searchTerm, result);
  return result;
}, [searchTerm]);



  const handleAddToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

return (
  <div
    style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto',
    }}
  >
    <h1>🛒 Point of Sales (POS)</h1>

    {/* Tombol Navigasi */}
    <div style={{ marginBottom: '20px' }}>
      <button onClick={() => setView('pos')}>POS</button>
      <button onClick={() => setView('about')} style={{ marginLeft: '10px' }}>
        Tentang
      </button>
    </div>

    {view === 'pos' ? (
      <>
        <div
          style={{
            backgroundColor: '#e8f5e9',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <strong>Keranjang:</strong> {cart.reduce((sum, i) => sum + i.quantity, 0)} item
        </div>

        <SearchBar onSearch={setSearchTerm} />
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <ProductList
            filteredProducts={filteredProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      </>
    ) : (
      <Suspense fallback={<div>Loading...</div>}>
        <AboutPage />
      </Suspense>
    )}
  </div>
);

}

export default App;
