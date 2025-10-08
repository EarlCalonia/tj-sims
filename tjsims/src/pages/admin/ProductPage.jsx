import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsPlus, BsPencil, BsTrash } from 'react-icons/bs';
import '../../styles/ProductPage.css';

const ProductPage = () => {
  // State for products
  const [products, setProducts] = useState([
    {
      id: 1,
      productId: 'PRD-001',
      name: 'Engine Oil Filter',
      brand: 'Bosch',
      category: 'Engine & Cooling',
      price: 450,
      status: 'Active',
      description: 'High-quality engine oil filter for various vehicle models',
      image: null
    },
    {
      id: 2,
      productId: 'PRD-002',
      name: 'Brake Pad Set',
      brand: 'Akebono',
      category: 'Brake Parts',
      price: 1200,
      status: 'Active',
      description: 'Front brake pad set for sedans and SUVs',
      image: null
    },
    {
      id: 3,
      productId: 'PRD-003',
      name: 'Shock Absorber',
      brand: 'KYB',
      category: 'Suspension & Steering',
      price: 3500,
      status: 'Inactive',
      description: 'Rear shock absorber for pickup trucks',
      image: null
    },
    {
      id: 4,
      productId: 'PRD-004',
      name: 'Radiator Hose',
      brand: 'Gates',
      category: 'Engine & Cooling',
      price: 680,
      status: 'Active',
      description: 'Upper radiator hose for diesel engines',
      image: null
    },
    {
      id: 5,
      productId: 'PRD-005',
      name: 'CV Joint Boot',
      brand: 'Moog',
      category: 'Transmission',
      price: 320,
      status: 'Active',
      description: 'CV joint boot kit with clamps and grease',
      image: null
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedBrand, setSelectedBrand] = useState('All Brand');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Categories for filter
  const categories = ['Engine & Cooling', 'Transmission', 'Suspension & Steering', 'Break Parts', 'Body & Exterior'];
  const brands = ['Bosch', 'Akebono', 'KYB', 'Gates', 'Moog'];
  const statuses = ['Active', 'Inactive'];

  // Filter products based on search and filters
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.productId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All Categories' || product.category === selectedCategory;
    const matchesBrand = selectedBrand === 'All Brand' || product.brand === selectedBrand;
    const matchesStatus = selectedStatus === 'All Status' || product.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const totalFilteredProducts = filteredProducts.length;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedBrand, selectedStatus]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle add new product
  const handleAddProduct = () => {
    setIsAddMode(true);
    setSelectedProduct({
      name: '',
      brand: '',
      category: '',
      price: 0,
      status: 'Active',
      description: '',
      image: null
    });
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setIsAddMode(false);
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  // Handle form submission
  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (isAddMode) {
      const newProduct = {
        ...selectedProduct,
        id: Math.max(...products.map(p => p.id)) + 1,
        productId: `PRD-${String(Math.max(...products.map(p => parseInt(p.productId.split('-')[1]))) + 1).padStart(3, '0')}`
      };
      setProducts([...products, newProduct]);
    } else {
      setProducts(products.map(product =>
        product.id === selectedProduct.id ? selectedProduct : product
      ));
    }
    setIsModalOpen(false);
  };

  // Handle input changes in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProduct({
      ...selectedProduct,
      [name]: value
    });
  };

  // Handle file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedProduct({
      ...selectedProduct,
      image: file
    });
  };

  return (
    <div className="product-layout">
      <Navbar />
      <main className="product-main">
        <div className="product-container">

          {/* Header Section */}
          <div className="product-header">
            <h1 className="product-title">Product Management</h1>
            <p className="product-subtitle">Manage your autoparts inventory and product details</p>
          </div>

          {/* Controls Section */}
          <div className="product-controls">
            <div className="add-product-section">
              <button className="add-product-btn" onClick={handleAddProduct}>
                <BsPlus className="plus-icon" />
                Add Product
              </button>
            </div>

            <div className="filter-section">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All Categories">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All Brand">All Brand</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="filter-dropdown"
              >
                <option value="All Status">All Status</option>
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn" type="button">
                  <BsSearch className="search-icon" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="products-table-section">
            <div className="table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.productId}</td>
                      <td>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td>{product.brand}</td>
                      <td className="price-cell">
                        ₱{product.price.toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge ${product.status.toLowerCase()}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="edit-btn"
                            title="Edit Product"
                          >
                            <BsPencil />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="delete-btn"
                            title="Delete Product"
                          >
                            <BsTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination and Results Info */}
            <div className="table-footer">
              <div className="results-info">
                Showing {totalFilteredProducts > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalFilteredProducts)} of {totalFilteredProducts} Products
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => index + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{isAddMode ? 'Add Product' : 'Edit Product'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="product-form">
              <div className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={selectedProduct?.name || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter product name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Brand</label>
                    <select
                      name="brand"
                      value={selectedProduct?.brand || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select Brand</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      name="category"
                      value={selectedProduct?.category || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Price (₱)</label>
                    <input
                      type="number"
                      name="price"
                      value={selectedProduct?.price || ''}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter price"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={selectedProduct?.description || ''}
                    onChange={handleInputChange}
                    className="form-textarea"
                    placeholder="Enter product description"
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Product Image</label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      id="product-image"
                      onChange={handleFileChange}
                      className="form-file-input"
                      accept="image/*"
                    />
                    <label htmlFor="product-image" className="upload-label">
                      <button type="button" className="upload-btn" onClick={() => document.getElementById('product-image').click()}>
                        Upload Image
                      </button>
                      <br></br>
                      <span className="upload-hint">PNG, JPG up to 5MB</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <div className="toggle-switch">
                    <input
                      type="checkbox"
                      id="status-toggle"
                      checked={selectedProduct?.status === 'Active'}
                      onChange={(e) => setSelectedProduct({
                        ...selectedProduct,
                        status: e.target.checked ? 'Active' : 'Inactive'
                      })}
                    />
                    <label htmlFor="status-toggle" className="toggle-label">
                      <span className="toggle-slider"></span>
                      <span className="toggle-text">
                        {selectedProduct?.status === 'Active' ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {isAddMode ? 'Save Product' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
