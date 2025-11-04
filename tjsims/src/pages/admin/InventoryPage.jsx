import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsPlus, BsPencil, BsBox, BsTags, BsTruck } from 'react-icons/bs';
import '../../styles/InventoryPage.css';
import { productAPI } from '../../utils/api';
import { inventoryAPI } from '../../utils/inventoryApi';

const InventoryPage = () => {
  // State for products and inventory stats
  const [products, setProducts] = useState([]);
  const [inventoryStats, setInventoryStats] = useState({
    totalProducts: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(true);
  const [isBulkStockInOpen, setIsBulkStockInOpen] = useState(false);
  const [bulkStockInData, setBulkStockInData] = useState({
    supplier: '',
    receivedBy: '',
    serialNumber: '',
    receivedDate: new Date().toISOString().slice(0, 16),
    products: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Load products and inventory stats on component mount
  useEffect(() => {
    loadProducts();
    loadInventoryStats();
  }, []);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filters object
      const filters = {};
      if (searchQuery) filters.search = searchQuery;
      if (selectedCategory !== 'All') filters.category = selectedCategory;
      if (selectedStatus !== 'All') filters.status = selectedStatus;

      const response = await inventoryAPI.getProducts(filters);
      if (response.success) {
        const productsWithInventory = response.data.products || [];
        console.log('Products with inventory:', productsWithInventory);
        setProducts(productsWithInventory);
      } else {
        setError('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Load inventory statistics
  const loadInventoryStats = async () => {
    try {
      const response = await inventoryAPI.getStats();
      if (response.success) {
        setInventoryStats(response.data);
      }
    } catch (error) {
      console.error('Error loading inventory stats:', error);
    }
  };

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
      reorderPoint: product.reorderPoint || 10,
      transactionDate: new Date().toISOString().slice(0,16),
      personName: localStorage.getItem('username') || 'Admin',
      serial: '',
      supplierSource: ''
    });
    setIsModalOpen(true);
  };

  // Handle bulk stock in
  const handleOpenBulkStockIn = () => {
    setBulkStockInData({
      supplier: '',
      receivedBy: localStorage.getItem('username') || '',
      serialNumber: '',
      receivedDate: new Date().toISOString().slice(0, 16),
      products: []
    });
    setIsBulkStockInOpen(true);
  };

  const handleAddProductRow = () => {
    setBulkStockInData(prev => ({
      ...prev,
      products: [...prev.products, { productId: '', productName: '', brand: '', quantity: 0 }]
    }));
  };

  const handleRemoveProductRow = (index) => {
    setBulkStockInData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  const handleProductRowChange = (index, field, value) => {
    setBulkStockInData(prev => {
      const newProducts = [...prev.products];
      newProducts[index] = { ...newProducts[index], [field]: value };
      
      // Auto-fill brand when product is selected
      if (field === 'productId') {
        const selectedProduct = products.find(p => p.product_id === value);
        if (selectedProduct) {
          newProducts[index].productName = selectedProduct.name;
          newProducts[index].brand = selectedProduct.brand;
        }
      }
      
      return { ...prev, products: newProducts };
    });
  };

  const handleBulkStockInSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (bulkStockInData.products.length === 0) {
      alert('Please add at least one product');
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        supplier: bulkStockInData.supplier,
        receivedBy: bulkStockInData.receivedBy,
        serialNumber: bulkStockInData.serialNumber,
        receivedDate: bulkStockInData.receivedDate,
        products: bulkStockInData.products.map(p => ({
          productId: p.productId,
          quantity: parseInt(p.quantity) || 0
        }))
      };

      const response = await inventoryAPI.bulkStockIn(payload);

      if (response.success) {
        alert('Bulk stock in completed successfully');
        await loadProducts();
        await loadInventoryStats();
        setIsBulkStockInOpen(false);
      }
    } catch (error) {
      console.error('Error in bulk stock in:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  // Handle form submission for stock update
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const payload = {
        quantityToAdd: selectedProduct.quantityToAdd,
        reorderPoint: selectedProduct.reorderPoint,
        notes: `Serial: ${selectedProduct.serial || '-'} | Supplier: ${selectedProduct.supplierSource || '-'}`,
        createdBy: selectedProduct.personName,
        transactionDate: selectedProduct.transactionDate
      };

      const response = await inventoryAPI.updateStock(selectedProduct.product_id, payload);

      if (response.success) {
        await loadProducts();
        await loadInventoryStats();
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
    } else if (name === 'transactionDate' || name === 'personName' || name === 'serial' || name === 'supplierSource') {
      setSelectedProduct({
        ...selectedProduct,
        [name]: value
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
                  {Array.from(new Set(products.map(p => p.category))).map(category => (
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
                <p className="stat-number total-products">{inventoryStats.totalProducts}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>In Stock</h3>
                <p className="stat-number in-stock">{inventoryStats.inStock}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Low on Stock</h3>
                <p className="stat-number low-stock">{inventoryStats.lowStock}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Out of Stock</h3>
                <p className="stat-number out-of-stock">{inventoryStats.outOfStock}</p>
              </div>
            </div>
          </div>

          {/* Stock In Button */}
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              onClick={handleOpenBulkStockIn}
              className="stock-in-btn-header"
              style={{ 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                padding: '10px 20px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <BsBox /> Stock In
            </button>
          </div>

          {/* Products Table */}
          <div className="products-table-section">
            {error && (
              <div className="error-message">
                <strong>Error:</strong> {error}
                <button onClick={loadProducts}>Retry</button>
              </div>
            )}

            {loading ? (
              <div className="loading-message">Loading products...</div>
            ) : (
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
                      <td>{product.product_id}</td>
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
                        {product.stock || 0}
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
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}

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

      {/* Bulk Stock In Modal */}
      {isBulkStockInOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '800px', width: '90%' }}>
            <div className="modal-header">
              <h2>Stock In</h2>
              <button onClick={() => setIsBulkStockInOpen(false)} className="close-btn">×</button>
            </div>

            <form onSubmit={handleBulkStockInSubmit} className="product-form">
              <div className="form-section">
                <div className="form-group">
                  <label>Supplier/Source</label>
                  <input
                    type="text"
                    value={bulkStockInData.supplier}
                    onChange={(e) => setBulkStockInData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="form-input"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Received By</label>
                  <input
                    type="text"
                    value={bulkStockInData.receivedBy}
                    onChange={(e) => setBulkStockInData(prev => ({ ...prev, receivedBy: e.target.value }))}
                    className="form-input"
                    placeholder="Enter receiver name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Serial Number</label>
                  <input
                    type="text"
                    value={bulkStockInData.serialNumber}
                    onChange={(e) => setBulkStockInData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="form-input"
                    placeholder="Enter serial number"
                  />
                </div>

                <div className="form-group">
                  <label>Date and Time Received</label>
                  <input
                    type="datetime-local"
                    value={bulkStockInData.receivedDate}
                    onChange={(e) => setBulkStockInData(prev => ({ ...prev, receivedDate: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div style={{ marginTop: '24px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>Products</h3>
                  <button
                    type="button"
                    onClick={handleAddProductRow}
                    style={{
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    + Add Row
                  </button>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Product Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px' }}>Brand</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', width: '100px' }}>Quantity</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '14px', width: '80px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkStockInData.products.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                          No products added. Click "+ Add Row" to add products.
                        </td>
                      </tr>
                    ) : (
                      bulkStockInData.products.map((row, index) => (
                        <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                          <td style={{ padding: '8px' }}>
                            <select
                              value={row.productId}
                              onChange={(e) => handleProductRowChange(index, 'productId', e.target.value)}
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map(p => (
                                <option key={p.product_id} value={p.product_id}>{p.name}</option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="text"
                              value={row.brand}
                              readOnly
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da', backgroundColor: '#e9ecef' }}
                            />
                          </td>
                          <td style={{ padding: '8px' }}>
                            <input
                              type="number"
                              value={row.quantity}
                              onChange={(e) => handleProductRowChange(index, 'quantity', e.target.value)}
                              min="1"
                              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ced4da' }}
                              required
                            />
                          </td>
                          <td style={{ padding: '8px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveProductRow(index)}
                              style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '13px'
                              }}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsBulkStockInOpen(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="confirm-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                      required
                    />
                  </div>
                </div>

                <>
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

                    <div className="form-row">
                      <div className="form-group">
                        <label>Transaction Date & Time</label>
                        <input
                          type="datetime-local"
                          name="transactionDate"
                          value={selectedProduct?.transactionDate || ''}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label>Person</label>
                        <input
                          type="text"
                          name="personName"
                          value={selectedProduct?.personName || ''}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter person"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Serial Number</label>
                        <input
                          type="text"
                          name="serial"
                          value={selectedProduct?.serial || ''}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter serial"
                        />
                      </div>
                      <div className="form-group">
                        <label>Supplier / Source</label>
                        <input
                          type="text"
                          name="supplierSource"
                          value={selectedProduct?.supplierSource || ''}
                          onChange={handleInputChange}
                          className="form-input"
                          placeholder="Enter supplier or source"
                        />
                      </div>
                    </div>

                <div className="alert-text">
                  <p>Alert when stock falls below this level</p>
                </div>
              </>
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
