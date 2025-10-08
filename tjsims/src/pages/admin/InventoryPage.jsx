import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsPlus, BsPencil, BsTrash, BsBox, BsTags, BsTruck } from 'react-icons/bs';
import '../../styles/InventoryPage.css';

const InventoryPage = () => {
  // State for products
  const [products, setProducts] = useState([
    {
      id: 1,
      name: 'Engine Oil Filter',
      brand: 'Bosch',
      category: 'Engine & Cooling',
      price: 450,
      stock: 25,
      supplier: 'Bosch Philippines',
      sku: 'EOF-001',
      description: 'High-quality engine oil filter for various vehicle models'
    },
    {
      id: 2,
      name: 'Brake Pad Set',
      brand: 'Akebono',
      category: 'Break Parts',
      price: 1200,
      stock: 18,
      supplier: 'Akebono Brake Corporation',
      sku: 'BPS-002',
      description: 'Front brake pad set for sedans and SUVs'
    },
    {
      id: 3,
      name: 'Shock Absorber',
      brand: 'KYB',
      category: 'Suspension and Steering',
      price: 3500,
      stock: 8,
      supplier: 'KYB Asia',
      sku: 'SA-003',
      description: 'Rear shock absorber for pickup trucks'
    },
    {
      id: 4,
      name: 'Radiator Hose',
      brand: 'Gates',
      category: 'Engine & Cooling',
      price: 680,
      stock: 0,
      supplier: 'Gates Corporation',
      sku: 'RH-004',
      description: 'Upper radiator hose for diesel engines'
    },
    {
      id: 5,
      name: 'CV Joint Boot',
      brand: 'Moog',
      category: 'Transmission',
      price: 320,
      stock: 15,
      supplier: 'Federal-Mogul',
      sku: 'CVJ-005',
      description: 'CV joint boot kit with clamps and grease'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Categories for filter
  const categories = ['All', 'Engine & Cooling', 'Transmission', 'Suspension and Steering', 'Break Parts', 'Body & Exterior'];

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || 
                         (selectedStatus === 'In Stock' && product.stock > 10) ||
                         (selectedStatus === 'Low on Stock' && product.stock <= 10 && product.stock > 0) ||
                         (selectedStatus === 'Out of Stock' && product.stock === 0);

    return matchesSearch && matchesCategory && matchesStatus;
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
  }, [searchQuery, selectedCategory, selectedStatus]);

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
      stock: 0,
      supplier: '',
      sku: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setIsAddMode(false);
    setSelectedProduct({
      ...product,
      quantityToAdd: 0,
      newTotal: product.stock,
      reorderPoint: product.reorderPoint || 10 // Default reorder point
    });
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
        id: Math.max(...products.map(p => p.id)) + 1
      };
      setProducts([...products, newProduct]);
    } else {
      // For edit mode, only update stock if quantity was added
      if (selectedProduct.quantityToAdd && selectedProduct.quantityToAdd > 0) {
        const updatedProduct = {
          ...selectedProduct,
          stock: selectedProduct.stock + selectedProduct.quantityToAdd,
          quantityToAdd: 0 // Reset after update
        };
        setProducts(products.map(product =>
          product.id === selectedProduct.id ? updatedProduct : product
        ));
      }
    }
    setIsModalOpen(false);
  };

  // Handle input changes in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantityToAdd') {
      const numValue = parseInt(value) || 0;
      setSelectedProduct({
        ...selectedProduct,
        quantityToAdd: numValue,
        newTotal: selectedProduct.stock + numValue
      });
    } else if (name === 'reorderPoint') {
      setSelectedProduct({
        ...selectedProduct,
        [name]: parseInt(value) || 0
      });
    }
  };

  return (
    
    <div className="inventory-layout">
     <Navbar />
      <main className="inventory-main">
        <div className="inventory-container">
     
          {/* Header Section */}
          <div className="inventory-header">
            <h1 className="inventory-title">Inventory Management</h1>
            <p className="inventory-subtitle">Monitor and adjust stock levels for all products</p>
          </div>

          {/* Controls Section */}
          <div className="inventory-controls">
            <div className="search-filter-section">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                <button className="search-btn" type="button">
                  <BsSearch />
                </button>
              </div>

              <div className="filter-section">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-filter"
                >
                  <option value="All">All Categories</option>
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="status-filter"
                >
                  <option value="All">All Status</option>
                  <option value="In Stock">In Stock</option>
                  <option value="Low on Stock">Low on Stock</option>
                  <option value="Out of Stock">Out of Stock</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="inventory-stats">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Products</h3>
                <p className="stat-number total-products">{products.length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>In Stock</h3>
                <p className="stat-number in-stock">{products.filter(p => p.stock > 10).length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Low on Stock</h3>
                <p className="stat-number low-stock">{products.filter(p => p.stock <= 10 && p.stock > 0).length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Out of Stock</h3>
                <p className="stat-number out-of-stock">{products.filter(p => p.stock === 0).length}</p>
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
                    <th>Quantity</th>
                    <th>Stock Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map(product => (
                    <tr key={product.id}>
                      <td>{product.sku}</td>
                      <td>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-brand">{product.brand}</p>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">{product.category}</span>
                      </td>
                      <td className="quantity-cell">
                        {product.stock}
                      </td>
                      <td>
                        <span className={`stock-status-badge ${product.stock > 10 ? 'in-stock' : product.stock > 0 ? 'low-stock' : 'out-of-stock'}`}>
                          {product.stock > 10 ? 'In Stock' : product.stock > 0 ? 'Low on Stock' : 'Out of Stock'}
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
                Showing {totalFilteredProducts > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalFilteredProducts)} of {totalFilteredProducts} products
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
              <h2>{isAddMode ? 'Add New Product' : 'Edit Product'}</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="product-form">
              <div className="form-section">
                <div className="form-group">
                  <label>Product Name</label>
                  <input
                    type="text"
                    value={selectedProduct?.name || ''}
                    readOnly
                    className="form-input readonly"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Current Stock</label>
                    <input
                      type="text"
                      value={selectedProduct?.stock || ''}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>

                  <div className="form-group">
                    <label>Add Quantity</label>
                    <input
                      type="number"
                      name="quantityToAdd"
                      value={selectedProduct?.quantityToAdd || ''}
                      onChange={handleInputChange}
                      min="0"
                      className="form-input"
                      placeholder="Enter quantity to add"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>New Total</label>
                    <input
                      type="text"
                      value={selectedProduct?.newTotal || selectedProduct?.stock || ''}
                      readOnly
                      className="form-input readonly"
                    />
                  </div>

                  <div className="form-group">
                    <label>Reorder Point</label>
                    <input
                      type="number"
                      name="reorderPoint"
                      value={selectedProduct?.reorderPoint || ''}
                      onChange={handleInputChange}
                      min="0"
                      className="form-input"
                      placeholder="Alert threshold"
                    />
                  </div>
                </div>

                <div className="alert-text">
                  <p>Alert when stock falls below this level</p>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  Confirm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
