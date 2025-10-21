import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../../components/client/Navbar';
import Footer from '../../components/client/Footer';
import '../../styles/Products.css';
import { inventoryAPI } from '../../utils/api';

const currency = (n) => `₱ ${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const search = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    // Pull products with inventory so we can show stock and filter by availability
    inventoryAPI.getProductsWithInventory()
      .then((res) => {
        const list = res?.data?.products || res?.data || res || [];
        // Normalize fields and filter Active with stock > 0
        const normalized = list.map(p => ({
          id: p.id,
          product_id: p.product_id || p.productId,
          name: p.name,
          brand: p.brand,
          category: p.category,
          price: p.price,
          status: p.status,
          image: p.image,
          stock: p.stock ?? p.currentStock ?? 0,
        }));
        const available = normalized.filter(p => p.status === 'Active' && Number(p.stock) > 0);
        if (isMounted) setProducts(available);
      })
      .catch((e) => setError(e.message))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [search, category]);

  const filtered = useMemo(() => {
    const base = products.filter(p => !category || p.category === category);
    if (!search) return base;
    const s = search.toLowerCase();
    return base.filter(p =>
      p.name?.toLowerCase().includes(s) ||
      p.brand?.toLowerCase().includes(s) ||
      p.category?.toLowerCase().includes(s) ||
      p.product_id?.toLowerCase().includes(s)
    );
  }, [products, search, category]);

  return (
    <div className="products-page">
      <Navbar />

      {/* Main Content */}
      <main className="products-main">
        <div className="products-header">
          <h1>PRODUCT CATALOG</h1>
          <p>Browse our complete inventory of automotive spare parts.</p>
        </div>

        {/* Search and Filter Section */}
        <div className="search-filter-container">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Search" 
              className="search-input"
              value={search}
              onChange={(e) => setSearchParams(prev => { const p = new URLSearchParams(prev); if (e.target.value) p.set('q', e.target.value); else p.delete('q'); return p; })}
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {/* Category Buttons */}
          <div className="category-buttons">
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.set('category','Engine & Cooling'); return np; })}>Engine & Cooling</button>
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.set('category','Transmission'); return np; })}>Transmission</button>
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.set('category','Suspension & Steering'); return np; })}>Suspension & Steering</button>
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.set('category','Brake Parts'); return np; })}>Brake Parts</button>
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.set('category','Body & Exterior'); return np; })}>Body & Exterior</button>
            <button className="category-btn" onClick={() => setSearchParams(p => { const np=new URLSearchParams(p); np.delete('category'); return np; })}>All Brands</button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {/* Sample Product Card */}
          {loading && <div className="product-card">Loading...</div>}
          {error && !loading && <div className="product-card">{error}</div>}
          {!loading && !error && filtered.map((p) => (
            <Link to={`/products/${encodeURIComponent(p.product_id || p.id)}`} key={p.product_id || p.id} className="product-card">
              <div className="product-image">
                <img src={p.image ? (p.image.startsWith('http') ? p.image : `http://localhost:5000${p.image}`) : ''} alt={p.name} onError={(e)=>{e.currentTarget.src='';}} />
              </div>
              <div className="product-info">
                <span className="brand">{p.brand}</span>
                <h3 className="product-name">{p.name}</h3>
                <div className="product-details">
                  <span className="price">{currency(p.price)}</span>
                  <span className="stock">Qty: {p.stock}</span>
                </div>
                <button className="view-details-btn">View Details</button>
              </div>
            </Link>
          ))}
          {/* More product cards will be added here */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;