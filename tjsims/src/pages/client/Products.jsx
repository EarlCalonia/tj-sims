import React from 'react';
import Navbar from '../../components/client/Navbar';
import Footer from '../../components/client/Footer';
import '../../styles/Products.css';

const Products = () => {
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
            />
            <button className="search-button">
              <i className="fas fa-search"></i>
            </button>
          </div>
          
          {/* Category Buttons */}
          <div className="category-buttons">
            <button className="category-btn">Engine & Cooling</button>
            <button className="category-btn">Transmission</button>
            <button className="category-btn">Suspension & Steering</button>
            <button className="category-btn">Brake Parts</button>
            <button className="category-btn">Body & Exterior</button>
            <button className="category-btn">All Brands</button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {/* Sample Product Card */}
          <div className="product-card">
            <div className="product-image">
              <img src="path_to_product_image" alt="Product" />
            </div>
            <div className="product-info">
              <span className="brand">Toyota</span>
              <h3 className="product-name">Hydrovac</h3>
              <div className="product-details">
                <span className="price">₱ 2,500.00</span>
                <span className="stock">Qty: 123</span>
              </div>
              <button className="view-details-btn">View Details</button>
            </div>
          </div>
          {/* More product cards will be added here */}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;