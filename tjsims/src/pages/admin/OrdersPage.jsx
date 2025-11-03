import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsEye, BsPencil } from 'react-icons/bs';
import '../../styles/OrdersPage.css';
import { salesAPI } from '../../utils/api';

// Order Modal Component
const OrderModal = ({ order, isOpen, onClose, onSave, ordersWithItems }) => {
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
      console.log('Modal order data:', order);
      console.log('Modal order status:', order.status);
      setEditPaymentMethod(order.payment || '');
      setEditPaymentStatus(order.payment_status || 'Unpaid');
      setEditOrderStatus(order.status || 'Pending');
    }
  }, [order]);

  if (!isOpen || !order) return null;

  // Get sale items for this order from the pre-loaded data
  const saleItems = ordersWithItems[order.id] || [];

  // Check if order is in a final state (Completed or Cancelled)
  const isOrderFinal = order.status === 'Completed' || order.status === 'Cancelled';
  const canUpdateOrder = !isOrderFinal;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canUpdateOrder) {
      alert('Cannot update order - order is already completed or cancelled');
      return;
    }

    setSaving(true);

    try {
      console.log('Submitting order update:', {
        orderId: order.id,
        newPaymentStatus: editPaymentStatus,
        newOrderStatus: editOrderStatus
      });

      await onSave(order.id, editPaymentMethod, editPaymentStatus, editOrderStatus);

      console.log('Order update successful');
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Order Details & Status Update</h2>
          <button onClick={onClose} className="close-btn" type="button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-section">
            <div className="form-group">
              <label>Order ID</label>
              <input type="text" value={order.sale_number} readOnly className="form-input readonly" />
            </div>

            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" value={order.customer_name} readOnly className="form-input readonly" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Payment Status</label>
                <input type="text" value={order.payment_status || 'Unpaid'} readOnly className="form-input readonly" />
              </div>
              <div className="form-group">
                <label>Current Order Status</label>
                <input
                  type="text"
                  value={order.status}
                  readOnly
                  className={`form-input readonly ${isOrderFinal ? 'final-status' : ''}`}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Payment Method</label>
                <input type="text" value={order.payment || ''} readOnly className="form-input readonly" />
              </div>
            </div>

            {isOrderFinal && (
              <div className="final-order-notice">
                <p>⚠️ This order is in a final state ({order.status}) and cannot be modified.</p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Update Payment Method</label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="form-input"
                  disabled={!canUpdateOrder}
                >
                  <option value="Cash">Cash</option>
                  <option value="GCash">GCash</option>
                  <option value="Card">Card</option>
                </select>
              </div>
              <div className="form-group">
                <label>Update Order Status</label>
                <select
                  value={editOrderStatus}
                  onChange={(e) => setEditOrderStatus(e.target.value)}
                  className="form-input"
                  disabled={!canUpdateOrder}
                >
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4>Order Items</h4>
              <div className="items-display">
                {saleItems && saleItems.length > 0 ? (
                  <div className="table-responsive">
                    <table className="items-table">
                      <thead>
                        <tr>
                          <th>Quantity</th>
                          <th>Product Name</th>
                          <th>Unit Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saleItems.map((item, index) => (
                          <tr key={index} className="item-row">
                            <td className="item-quantity">
                              <span className="quantity-badge">{item.quantity || 0}</span>
                            </td>
                            <td className="item-name">
                              <span className="product-name-text">{item.product_name || 'Unknown Product'}</span>
                            </td>
                            <td className="item-price">
                              <span className="price-text">₱{Number(item.price || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="item-total-row">
                          <td colSpan="2" className="total-label-cell">
                            <strong>Total</strong>
                          </td>
                          <td className="total-amount-cell">
                            <strong className="final-total">₱{Number(order.total || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-items-message">
                    <p>No items found for this order.</p>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '8px' }}>
                      This order may not have any products, or there might be an issue loading the data.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>Customer & Delivery Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" value={order.contact || ''} readOnly className="form-input readonly" />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <input type="text" value={order.payment} readOnly className="form-input readonly" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Order Date</label>
                  <input type="text" value={new Date(order.created_at).toLocaleDateString()} readOnly className="form-input readonly" />
                </div>
                <div className="form-group">
                  <label>Items Count</label>
                  <input type="text" value={saleItems.length} readOnly className="form-input readonly" />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button
              type="submit"
              className={`confirm-btn ${!canUpdateOrder ? 'disabled' : ''}`}
              disabled={saving || !canUpdateOrder}
            >
              {saving ? 'Saving...' : canUpdateOrder ? 'Save Changes' : 'Order Finalized'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  // State for API integration
  const [orders, setOrders] = useState([]);
  const [ordersWithItems, setOrdersWithItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Existing state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('All Order Status');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All Payment Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch orders and their items from API (guard against StrictMode double-invoke)
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    fetchOrdersWithItems();
  }, []);

  const fetchOrdersWithItems = async () => {
    try {
      setLoading(true);
      setError(null);

      // Retry wrapper for initial sales fetch (handles 429s)
      const getSalesWithRetry = async (attempt = 0) => {
        try {
          return await salesAPI.getSales();
        } catch (e) {
          const is429 = (e.message || '').toLowerCase().includes('too many requests');
          if (is429 && attempt < 3) {
            const delay = (attempt + 1) * 600; // 600ms, 1200ms, 1800ms
            await new Promise(r => setTimeout(r, delay));
            return getSalesWithRetry(attempt + 1);
          }
          throw e;
        }
      };

      // Fetch orders first (with retry)
      const ordersData = await getSalesWithRetry();
      setOrders(ordersData);

      // Helper: retry on 429 with small backoff
      const fetchItemsWithRetry = async (saleId, attempt = 0) => {
        try {
          return await salesAPI.getSaleItems(saleId);
        } catch (e) {
          const is429 = (e.message || '').toLowerCase().includes('too many requests');
          if (is429 && attempt < 3) {
            const delay = (attempt + 1) * 500; // 500ms, 1000ms, 1500ms
            await new Promise(r => setTimeout(r, delay));
            return fetchItemsWithRetry(saleId, attempt + 1);
          }
          throw e;
        }
      };

      // Fetch sale items for each order (staggered to avoid rate limiting)
      const ordersWithItemsData = {};
      for (const order of ordersData) {
        try {
          const items = await fetchItemsWithRetry(order.id);
          ordersWithItemsData[order.id] = items || [];
          // small delay between requests
          await new Promise(r => setTimeout(r, 120));
        } catch (error) {
          console.error(`Error fetching items for order ${order.id}:`, error);
          ordersWithItemsData[order.id] = [];
        }
      }
      setOrdersWithItems(ordersWithItemsData);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to calculate total items for an order
  const getOrderItemsCount = (orderId) => {
    const items = ordersWithItems[orderId] || [];
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Helper function to get items text for display
  const getOrderItemsText = (orderId) => {
    const items = ordersWithItems[orderId] || [];
    const totalItems = getOrderItemsCount(orderId);

    if (totalItems === 0) {
      return '0 items';
    } else if (totalItems === 1) {
      return '1 item';
    } else {
      return `${totalItems} items`;
    }
  };

  // Helper function to map database status to CSS class names
  const getStatusClassName = (status) => {
    const statusMap = {
      'Processing': 'processing',
      'Confirmed': 'completed',
      'Shipped': 'shipping',
      'Delivered': 'completed',
      'Cancelled': 'canceled',
      'Pending': 'pending',
      'Completed': 'completed',
      'Canceled': 'canceled'
    };
    return statusMap[status] || 'processing';
  };

  // Helper function to map payment method to CSS class names
  const getPaymentMethodClassName = (method) => {
    const methodMap = {
      'Cash': 'cash',
      'GCash': 'gcash',
      'Card': 'card',
    };
    return methodMap[method] || 'unknown-payment';
  };

  const getPaymentStatusClassName = (status) => {
    const statusMap = {
      'Paid': 'paid',
      'Unpaid': 'unpaid',
    };
    return statusMap[status] || 'unknown-status';
  };

  // Order status options
  const orderStatuses = ['All Order Status', 'Pending', 'Processing', 'Completed', 'Cancelled'];

  // Payment status options
  const paymentStatuses = ['All Payment Status', 'Paid', 'Unpaid'];

  // Filter orders based on search and status
  const filteredOrders = (orders || []).filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.sale_number.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrderStatus = selectedOrderStatus === 'All Order Status' || order.status === selectedOrderStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'All Payment Status' || (order.payment_status || 'Unpaid') === selectedPaymentStatus;

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);
  const totalFilteredOrders = filteredOrders.length;

  // Calculate stats reactively (add safety checks)
  const stats = useMemo(() => {
    const ordersList = orders || [];
    return {
      totalOrders: ordersList.length,
      pendingOrders: ordersList.filter(order => order.status === 'Processing').length,
      paidOrders: ordersList.filter(order => (order.payment_status || 'Unpaid') === 'Paid').length,
      totalRevenue: ordersList
        .filter(order => order.status !== 'Cancelled')
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0)
    };
  }, [orders]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedOrderStatus, selectedPaymentStatus]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle view order (opens modal)
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle close modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Handle update order (quick update button)
  const handleUpdateOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  // Handle save changes from modal (update order status)
  const handleSaveChanges = async (orderId, newPaymentMethod, newPaymentStatus, newOrderStatus) => {
    try {
      console.log('🔄 Starting order update:', {
        orderId,
        newPaymentMethod,
        newPaymentStatus,
        newOrderStatus,
        currentOrderStatus: selectedOrder?.status
      });

      const updateData = {
        payment: newPaymentMethod,
        payment_status: newPaymentStatus,
        status: newOrderStatus
      };

      console.log('📡 Sending API request to update sale:', updateData);

      const result = await salesAPI.updateSale(orderId, updateData);

      console.log('✅ API Response:', result);

      if (result && result.success) {
        console.log('🎉 Order updated successfully, refreshing data...');

        // Refresh orders and items data after update
        await fetchOrdersWithItems();

        console.log('📊 Data refreshed, closing modal...');
        handleCloseModal();

        console.log('✨ Modal closed successfully');
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Error updating order:', error);
      console.error('❌ Error details:', error.message);
      alert(`Failed to update order: ${error.message}`);
    }
  };

  return (
    <>
      <div className="orders-layout">
        <Navbar />
        <main className="orders-main">
          <div className="orders-container">

            {/* Header Section */}
            <div className="orders-header">
              <h1 className="orders-title">Order Management</h1>
              <p className="orders-subtitle">Track and manage customer orders and payments.</p>
            </div>

            {error && (
              <div className="error-banner">
                <p>{error}</p>
                <button onClick={fetchOrdersWithItems} className="retry-btn">
                  Retry
                </button>
              </div>
            )}

            {/* Controls Section */}
            <div className="orders-controls">
              <div className="search-filter-section">
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search orders..."
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
                    value={selectedOrderStatus}
                    onChange={(e) => setSelectedOrderStatus(e.target.value)}
                    className="order-status-filter"
                  >
                    {orderStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>

                  <select
                    value={selectedPaymentStatus}
                    onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                    className="payment-status-filter"
                  >
                    {paymentStatuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="orders-stats">
              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Total Orders</h3>
                  <p className="stat-number total-orders">{stats.totalOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Pending Orders</h3>
                  <p className="stat-number pending-orders">{stats.pendingOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Paid Orders</h3>
                  <p className="stat-number paid-orders">{stats.paidOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-number total-revenue">₱{Number(stats.totalRevenue || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-section">
              <div className="table-container">
                {loading ? (
                  <div className="loading-state">
                    <p>Loading orders...</p>
                  </div>
                ) : (
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Order Date</th>
                        <th>Items</th>
                        <th>Payment Method</th>
                        <th>Payment Status</th>
                        <th>Order Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="order-id-cell">{order.sale_number || 'N/A'}</td>
                          <td>
                            <div className="customer-info">
                              <h4>{order.customer_name || 'Unknown Customer'}</h4>
                            </div>
                          </td>
                          <td>{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div className="product-list">
                              <span className="product-names" title={getOrderItemsText(order.id)}>
                                {getOrderItemsText(order.id)}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`payment-status-badge ${getPaymentMethodClassName(order.payment)}`}>
                              {order.payment || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className={`payment-status-badge ${getPaymentStatusClassName(order.payment_status || 'Unpaid')}`}>
                              {order.payment_status || 'Unpaid'}
                            </span>
                          </td>
                          <td>
                            <span className={`order-status-badge ${getStatusClassName(order.status)}`}>
                              {order.status || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="view-btn"
                                title="View Order"
                              >
                                <BsEye />
                              </button>
                              <button
                                onClick={() => handleUpdateOrder(order)}
                                className="update-btn"
                                title="Update Order"
                              >
                                <BsPencil />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination and Results Info */}
              <div className="table-footer">
                <div className="results-info">
                  Showing {totalFilteredOrders > 0 ? startIndex + 1 : 0} to {Math.min(endIndex, totalFilteredOrders)} of {totalFilteredOrders} orders
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
      </div>

      <OrderModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveChanges}
        ordersWithItems={ordersWithItems}
      />
    </>
  );
};

export default OrdersPage;
