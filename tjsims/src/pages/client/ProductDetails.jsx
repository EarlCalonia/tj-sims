import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import Navbar from '../../components/client/Navbar';
import Footer from '../../components/client/Footer';
import { productAPI, inventoryAPI } from '../../utils/api';

const currency = (n) => `₱ ${Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const ProductDetails = () => {
  const { id } = useParams(); // URL slug (product name)
  const location = useLocation();
  const productId = location.state?.productId; // Actual product ID from state
  const [product, setProduct] = useState(null);
  const [stock, setStock] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        // Use productId from state, fallback to id param for backward compatibility
        const lookupId = productId || id;
        const res = await productAPI.getProductById(lookupId);
        const p = res?.data || res; // backend may wrap
        if (mounted) setProduct(p);
        try {
          const invRes = await inventoryAPI.getProductsWithInventory();
          // API shape can be either { data: { products: [...] } } or { data: [...] }
          const list = invRes?.data?.products || invRes?.data || invRes || [];
          const found = list.find((x) => (x.product_id || x.productId) === (p.product_id || lookupId));
          if (mounted) setStock(found?.stock ?? found?.currentStock ?? 0);
        } catch {}
      } catch (e) {
        setError(e.message || 'Failed to load product');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, productId]);

  return (
    <div className="products-page">
      <Navbar />
      <main className="products-main" style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <Link to="/products" className="nav-link">← Back to Products</Link>
        </div>
        {loading && <div className="product-card">Loading...</div>}
        {error && !loading && <div className="product-card">{error}</div>}
        {!loading && !error && product && (() => {
          const available = (product.status === 'Active') && (Number(stock) > 0);
          if (!available) {
            return (
              <div className="product-card" style={{ padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <h2 style={{ marginTop: 0, color: '#0f2544' }}>Product Unavailable</h2>
                <p style={{ color: '#475569' }}>This product is currently not available. It may be out of stock or inactive.</p>
                <div style={{ marginTop: 12 }}>
                  <Link to="/products" className="nav-link">← Back to Products</Link>
                </div>
              </div>
            );
          }
          return (
          <div className="details-card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <div className="image-col" style={{ borderRight: '1px solid #eee', paddingRight: 24 }}>
              <div style={{ width: '100%', paddingTop: '75%', position: 'relative', background: '#fafafa', borderRadius: 8, overflow: 'hidden' }}>
                <img
                  src={product.image ? (String(product.image).startsWith('http') ? product.image : `http://localhost:5000${product.image}`) : ''}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
            <div className="info-col" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h1 style={{ margin: 0, fontSize: 28, color: '#0f2544' }}>{product.name}</h1>
              <div className="meta" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge" style={{ background: '#eef6ff', color: '#0b63c5', padding: '4px 10px', borderRadius: 999 }}>{product.brand}</span>
                <span className="badge" style={{ background: '#f1f8e9', color: '#33691e', padding: '4px 10px', borderRadius: 999 }}>{product.category}</span>
                <span className="badge" style={{ background: product.status === 'Active' ? '#e8f5e9' : '#ffebee', color: product.status === 'Active' ? '#1b5e20' : '#b71c1c', padding: '4px 10px', borderRadius: 999 }}>{product.status}</span>
              </div>
              <div className="price" style={{ fontSize: 24, fontWeight: 700, color: '#0b63c5' }}>{currency(product.price)}</div>
              {Number(stock) > 0 && product.status === 'Active' && (
                <div className="stock" style={{ fontSize: 14, color: '#455a64' }}>In stock: <strong>{stock}</strong></div>
              )}
              <div className="description" style={{ marginTop: 8, whiteSpace: 'pre-wrap', color: '#37474f' }}>
                {product.description || 'No description provided.'}
              </div>
              
              {/* Vehicle Compatibility Section */}
              {product.vehicle_compatibility && (
                <div className="vehicle-compatibility" style={{ marginTop: 20, padding: 16, background: '#f8f9fa', borderRadius: 8, border: '1px solid #e9ecef' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#0f2544', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 20 }}>🚗</span>
                    Vehicle Compatibility
                  </h3>
                  <div style={{ fontSize: 14, color: '#475569', lineHeight: 1.6 }}>
                    {typeof product.vehicle_compatibility === 'string' 
                      ? product.vehicle_compatibility.split(',').map((v, i) => (
                          <div key={i} style={{ padding: '6px 0', borderBottom: i < product.vehicle_compatibility.split(',').length - 1 ? '1px solid #e9ecef' : 'none' }}>
                            • {v.trim()}
                          </div>
                        ))
                      : Array.isArray(product.vehicle_compatibility)
                      ? product.vehicle_compatibility.map((v, i) => (
                          <div key={i} style={{ padding: '6px 0', borderBottom: i < product.vehicle_compatibility.length - 1 ? '1px solid #e9ecef' : 'none' }}>
                            • {v}
                          </div>
                        ))
                      : <div>{product.vehicle_compatibility}</div>
                    }
                  </div>
                </div>
              )}
              
              <div className="sub-details" style={{ marginTop: 12, fontSize: 14, color: '#546e7a' }}></div>
            </div>
          </div>
          );
        })()}
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetails;
