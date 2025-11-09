import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsEye, BsPencil, BsArrowReturnLeft, BsFileText } from 'react-icons/bs';
import '../../styles/OrdersPage.css';
import { salesAPI, returnsAPI } from '../../utils/api';

// Order Modal Component
const OrderModal = ({ order, isOpen, onClose, onSave, ordersWithItems }) => {
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editPaymentStatus, setEditPaymentStatus] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) {
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
      await onSave(order.id, editPaymentMethod, editPaymentStatus, editOrderStatus);
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
              {order.delivery_proof && order.status === 'Completed' && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Proof of Delivery</label>
                  <div style={{ marginTop: '8px' }}>
                    <img 
                      src={`http://localhost:5000${order.delivery_proof}`} 
                      alt="Delivery Proof" 
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '400px', 
                        borderRadius: '8px', 
                        border: '1px solid #ddd',
                        display: 'block'
                      }}
                    />
                  </div>
                </div>
              )}
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
  
  // Return modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnOrder, setReturnOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [returnReason, setReturnReason] = useState('');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);
  const [photoProof, setPhotoProof] = useState(null);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [processingReturn, setProcessingReturn] = useState(false);
  
  // Refund receipt state
  const [showRefundReceipt, setShowRefundReceipt] = useState(false);
  const [refundReceiptData, setRefundReceiptData] = useState(null);
  
  // View returns state
  const [isViewReturnsModalOpen, setIsViewReturnsModalOpen] = useState(false);
  const [selectedOrderReturns, setSelectedOrderReturns] = useState([]);

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
      
      // Auto-complete in-store pickup orders
      await autoCompleteInStorePickups();

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

  // Handle return order
  const handleReturnOrder = (order) => {
    const items = ordersWithItems[order.id] || [];
    // Initialize return items with checkboxes unchecked and quantity 0
    const initReturnItems = items.map(item => ({
      saleItemId: item.id,
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku || '',
      price: parseFloat(item.price || 0),
      orderedQuantity: parseInt(item.quantity || 0),
      returnQuantity: 0,
      selected: false
    }));
    
    setReturnOrder(order);
    setReturnItems(initReturnItems);
    setReturnReason('');
    setRefundMethod('Cash');
    setReferenceNumber('');
    setRestockInventory(true);
    setPhotoProof(null);
    setAdditionalNotes('');
    setIsReturnModalOpen(true);
  };

  // Handle return item selection
  const handleReturnItemToggle = (index) => {
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, selected: !item.selected, returnQuantity: !item.selected ? item.orderedQuantity : 0 } : item
    ));
  };

  // Handle return quantity change
  const handleReturnQuantityChange = (index, value) => {
    const qty = parseInt(value) || 0;
    setReturnItems(prev => prev.map((item, i) => 
      i === index ? { ...item, returnQuantity: Math.min(Math.max(0, qty), item.orderedQuantity) } : item
    ));
  };

  // Calculate total refund amount
  const calculateRefundAmount = () => {
    return returnItems
      .filter(item => item.selected && item.returnQuantity > 0)
      .reduce((total, item) => total + (item.price * item.returnQuantity), 0);
  };
  
  // Handle view returns
  const handleViewReturns = async (order) => {
    try {
      const returns = await returnsAPI.getReturnsByOrder(order.id);
      if (returns.success && returns.data && returns.data.length > 0) {
        setSelectedOrderReturns(returns.data);
        setIsViewReturnsModalOpen(true);
      } else {
        alert('No return history found for this order');
      }
    } catch (error) {
      console.error('Error fetching returns:', error);
      alert('Failed to fetch return history');
    }
  };

  // Handle process return
  const handleProcessReturn = async () => {
    try {
      // Validation
      const selectedItems = returnItems.filter(item => item.selected && item.returnQuantity > 0);
      if (selectedItems.length === 0) {
        alert('Please select at least one item with quantity greater than 0');
        return;
      }
      
      if (!returnReason) {
        alert('Please select a return reason');
        return;
      }
      
      if (!photoProof) {
        alert('Please upload a photo proof');
        return;
      }
      
      if (refundMethod === 'GCash' && !referenceNumber) {
        alert('Please enter GCash reference number');
        return;
      }
      
      setProcessingReturn(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('orderId', returnOrder.id);
      formData.append('saleNumber', returnOrder.sale_number);
      formData.append('customerName', returnOrder.customer_name);
      formData.append('returnReason', returnReason);
      formData.append('refundMethod', refundMethod);
      formData.append('referenceNumber', referenceNumber || '');
      formData.append('restocked', restockInventory);
      formData.append('additionalNotes', additionalNotes || '');
      formData.append('processedBy', localStorage.getItem('username') || 'Admin');
      formData.append('returnItems', JSON.stringify(selectedItems.map(item => ({
        saleItemId: item.saleItemId,
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        quantity: item.returnQuantity,
        price: item.price
      }))));
      
      // Append photo proof file
      if (photoProof) {
        formData.append('photoProof', photoProof);
      }
      
      const result = await returnsAPI.processReturn(formData);
      
      if (result.success) {
        // Prepare receipt data
        const receiptData = {
          returnId: result.data.returnId,
          orderId: returnOrder.sale_number,
          refundDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          customerName: returnOrder.customer_name,
          returnedItems: selectedItems,
          returnReason: returnReason,
          refundMethod: refundMethod,
          restocked: restockInventory,
          totalRefund: calculateRefundAmount(),
          originalOrderDate: new Date(returnOrder.created_at).toLocaleDateString(),
          originalPayment: returnOrder.payment,
          processedBy: localStorage.getItem('username') || 'Admin'
        };
        
        setRefundReceiptData(receiptData);
        setIsReturnModalOpen(false);
        setShowRefundReceipt(true);
        await fetchOrdersWithItems(); // Refresh orders
      }
    } catch (error) {
      console.error('Error processing return:', error);
      alert(`Failed to process return: ${error.message}`);
    } finally {
      setProcessingReturn(false);
    }
  };
  
  // Order status options
  const orderStatuses = ['All Order Status', 'Pending', 'Processing', 'Completed', 'Cancelled', 'Returned', 'Partially Returned'];

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

  // Calculate stats reactively (add safety checks and subtract refunds)
  const stats = useMemo(() => {
    const ordersList = orders || [];
    return {
      totalOrders: ordersList.length,
      pendingOrders: ordersList.filter(order => order.status === 'Processing').length,
      paidOrders: ordersList.filter(order => (order.payment_status || 'Unpaid') === 'Paid').length,
      totalRevenue: ordersList
        .filter(order => order.status !== 'Cancelled')
        .reduce((sum, order) => {
          const orderTotal = parseFloat(order.total || 0);
          const refundAmount = parseFloat(order.refund_amount || 0);
          return sum + (orderTotal - refundAmount);
        }, 0)
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

  // Auto-complete in-store pickup orders
  const autoCompleteInStorePickups = async () => {
    try {
      const allSales = await salesAPI.getSales();
      const inStorePickups = allSales.filter(sale => 
        sale.delivery_type === 'In-store' && 
        sale.status === 'Pending' &&
        sale.payment_status === 'Paid'
      );
      
      for (const sale of inStorePickups) {
        await salesAPI.updateSale(sale.id, { status: 'Completed' });
      }
    } catch (error) {
      console.error('Error auto-completing in-store pickups:', error);
    }
  };
  
  // Handle save changes from modal (update order status)
  const handleSaveChanges = async (orderId, newPaymentMethod, newPaymentStatus, newOrderStatus) => {
    try {
      const updateData = {
        payment: newPaymentMethod,
        payment_status: newPaymentStatus,
        status: newOrderStatus
      };

      const result = await salesAPI.updateSale(orderId, updateData);

      if (result && result.success) {
        await fetchOrdersWithItems();
        handleCloseModal();
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error updating order:', error);
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
                              {/* Show return button only for Completed orders with Paid status */}
                              {order.status === 'Completed' && order.payment_status === 'Paid' && (
                                <button
                                  onClick={() => handleReturnOrder(order)}
                                  className="return-btn"
                                  title="Process Return"
                                >
                                  <BsArrowReturnLeft />
                                </button>
                              )}
                              {/* Show View Returns button for Returned or Partially Returned orders */}
                              {(order.status === 'Returned' || order.status === 'Partially Returned') && (
                                <button
                                  onClick={() => handleViewReturns(order)}
                                  className="view-returns-btn"
                                  title="View Return Details"
                                >
                                  <BsFileText />
                                </button>
                              )}
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

      {/* Return Modal */}
      {isReturnModalOpen && returnOrder && (
        <div className="modal-overlay" onClick={() => setIsReturnModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', width: '95%' }}>
            <div className="modal-header">
              <h2>Process Return</h2>
              <button onClick={() => setIsReturnModalOpen(false)} className="close-btn">×</button>
            </div>

            <div className="return-modal-body">
              {/* Order Information Header */}
              <div className="return-header-info">
                <div className="info-row">
                  <div className="info-item">
                    <span className="info-label">Order ID:</span>
                    <span className="info-value">{returnOrder.sale_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Customer:</span>
                    <span className="info-value">{returnOrder.customer_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Order Date:</span>
                    <span className="info-value">{new Date(returnOrder.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Return Items Table */}
              <div className="return-items-section">
                <h4>Select Items to Return</h4>
                <table className="return-items-table">
                  <thead>
                    <tr>
                      <th style={{ width: '50px' }}>Select</th>
                      <th>Product Name</th>
                      <th style={{ width: '120px' }}>Ordered Qty</th>
                      <th style={{ width: '120px' }}>Return Qty</th>
                      <th style={{ width: '120px' }}>Price</th>
                      <th style={{ width: '120px' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.map((item, index) => (
                      <tr key={index} className={item.selected ? 'selected-row' : ''}>
                        <td>
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleReturnItemToggle(index)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                          />
                        </td>
                        <td>{item.productName}</td>
                        <td>{item.orderedQuantity}</td>
                        <td>
                          <input
                            type="number"
                            min="0"
                            max={item.orderedQuantity}
                            value={item.returnQuantity}
                            onChange={(e) => handleReturnQuantityChange(index, e.target.value)}
                            disabled={!item.selected}
                            className="form-input"
                            style={{ width: '80px', padding: '6px' }}
                          />
                        </td>
                        <td>₱{item.price.toFixed(2)}</td>
                        <td>₱{(item.price * item.returnQuantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Return Details Form */}
              <div className="return-details-section">
                <div className="form-group">
                  <label>Return Reason <span style={{ color: 'red' }}>*</span></label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="form-input"
                    required
                  >
                    <option value="">Select reason...</option>
                    <option value="Defective/Damaged">Defective/Damaged</option>
                    <option value="Wrong Item">Wrong Item</option>
                    <option value="Not as Described">Not as Described</option>
                    <option value="Customer Changed Mind">Customer Changed Mind</option>
                    <option value="Compatibility Issue">Compatibility Issue</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Refund Method <span style={{ color: 'red' }}>*</span></label>
                  <div className="refund-method-radios">
                    <label style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                      <input
                        type="radio"
                        name="refundMethod"
                        value="Cash"
                        checked={refundMethod === 'Cash'}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      Cash
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center' }}>
                      <input
                        type="radio"
                        name="refundMethod"
                        value="GCash"
                        checked={refundMethod === 'GCash'}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      GCash
                    </label>
                  </div>
                </div>

                {refundMethod === 'GCash' && (
                  <div className="form-group">
                    <label>GCash Reference Number <span style={{ color: 'red' }}>*</span></label>
                    <input
                      type="text"
                      value={referenceNumber}
                      onChange={(e) => setReferenceNumber(e.target.value)}
                      className="form-input"
                      placeholder="Enter GCash reference number"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Photo Proof <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPhotoProof(e.target.files[0])}
                    className="form-input"
                    style={{ padding: '8px' }}
                  />
                  {photoProof && (
                    <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
                      Selected: {photoProof.name}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      checked={restockInventory}
                      onChange={(e) => setRestockInventory(e.target.checked)}
                      style={{ marginRight: '8px', width: '18px', height: '18px' }}
                    />
                    Add returned items back to inventory
                  </label>
                </div>

                <div className="form-group">
                  <label>Additional Notes (Optional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="form-input"
                    rows="3"
                    placeholder="Enter any additional notes about this return..."
                  />
                </div>
              </div>

              {/* Refund Summary */}
              <div className="refund-summary">
                <h4>Refund Summary</h4>
                <div className="summary-row">
                  <span className="summary-label">Total Refund Amount:</span>
                  <span className="summary-value">₱{calculateRefundAmount().toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="cancel-btn"
                  disabled={processingReturn}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleProcessReturn}
                  className="confirm-btn"
                  disabled={processingReturn || returnItems.filter(i => i.selected && i.returnQuantity > 0).length === 0 || !returnReason}
                  style={{ backgroundColor: processingReturn ? '#ccc' : '#dc3545' }}
                >
                  {processingReturn ? 'Processing...' : 'Process Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Refund Receipt Modal */}
      {showRefundReceipt && refundReceiptData && (
        <div className="modal-overlay" onClick={() => setShowRefundReceipt(false)}>
          <div className="modal-content refund-receipt-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Refund Receipt</h2>
              <button onClick={() => setShowRefundReceipt(false)} className="close-btn">×</button>
            </div>

            <div className="receipt-content" id="refund-receipt">
              <div className="receipt-header">
                <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <h3 style={{ textAlign: 'center', margin: '10px 0', fontSize: '1.3rem' }}>TJC AUTO SUPPLY</h3>
                <p style={{ textAlign: 'center', margin: '5px 0', fontSize: '0.9rem' }}>TJ Cabrera St. cor A, Maceda St., Ayala Alabang, Muntinlupa, 1770 Metro Manila</p>
                <p style={{ textAlign: 'center', margin: '5px 0', fontSize: '0.9rem' }}>Contact: 0917 420 5498</p>
                <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
                <h4 style={{ textAlign: 'center', margin: '15px 0', fontSize: '1.2rem' }}>REFUND RECEIPT</h4>
              </div>

              <div className="receipt-info">
                <div style={{ marginBottom: '8px' }}>
                  <strong>Refund ID:</strong> <span style={{ float: 'right' }}>{refundReceiptData.returnId}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Original Order ID:</strong> <span style={{ float: 'right' }}>{refundReceiptData.orderId}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Refund Date:</strong> <span style={{ float: 'right' }}>{refundReceiptData.refundDate}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Customer:</strong> <span style={{ float: 'right' }}>{refundReceiptData.customerName}</span>
                </div>
              </div>

              <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              <h4 style={{ margin: '15px 0 10px 0' }}>RETURNED ITEMS:</h4>

              <div className="receipt-items">
                {refundReceiptData.returnedItems.map((item, index) => (
                  <div key={index} style={{ marginBottom: '15px' }}>
                    <div style={{ fontWeight: '600' }}>{item.productName} {item.sku && `(${item.sku})`}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', paddingLeft: '10px' }}>
                      <span>Qty: {item.returnQuantity} x ₱{item.price.toFixed(2)}</span>
                      <span style={{ fontWeight: '600' }}>₱{(item.returnQuantity * item.price).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              
              <div className="receipt-details" style={{ margin: '15px 0' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Refund Reason:</strong> <span style={{ float: 'right' }}>{refundReceiptData.returnReason}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Refund Method:</strong> <span style={{ float: 'right' }}>{refundReceiptData.refundMethod}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Items Restocked:</strong> <span style={{ float: 'right' }}>{refundReceiptData.restocked ? 'Yes' : 'No'}</span>
                </div>
              </div>

              <div className="receipt-total" style={{ fontSize: '1.2rem', fontWeight: '700', textAlign: 'right', marginBottom: '15px' }}>
                <strong>TOTAL REFUND:</strong> <span style={{ marginLeft: '20px' }}>₱{refundReceiptData.totalRefund.toFixed(2)}</span>
              </div>

              <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
              
              <div className="receipt-footer" style={{ margin: '15px 0' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Original Order Date:</strong> <span style={{ float: 'right' }}>{refundReceiptData.originalOrderDate}</span>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <strong>Original Payment:</strong> <span style={{ float: 'right' }}>{refundReceiptData.originalPayment}</span>
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Processed by:</strong> <span style={{ float: 'right' }}>{refundReceiptData.processedBy}</span>
                </div>
                <div style={{ marginTop: '20px', marginBottom: '10px' }}>
                  <strong>Signature:</strong> <span style={{ borderBottom: '1px solid #000', display: 'inline-block', width: '200px', marginLeft: '10px' }}></span>
                </div>
              </div>

              <div style={{ textAlign: 'center', margin: '20px 0 10px 0', fontSize: '0.95rem' }}>
                Thank you for your business!
              </div>
              <div className="receipt-title">━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</div>
            </div>

            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button onClick={() => setShowRefundReceipt(false)} className="cancel-btn">
                Close
              </button>
              <button 
                onClick={() => window.print()} 
                className="confirm-btn"
                style={{ backgroundColor: '#28a745' }}
              >
                Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Returns Modal */}
      {isViewReturnsModalOpen && selectedOrderReturns.length > 0 && (
        <div className="modal-overlay" onClick={() => setIsViewReturnsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <h2>Return History</h2>
              <button onClick={() => setIsViewReturnsModalOpen(false)} className="close-btn">×</button>
            </div>

            <div style={{ padding: '20px', maxHeight: '600px', overflowY: 'auto' }}>
              {selectedOrderReturns.map((returnRecord, index) => (
                <div key={index} style={{ 
                  marginBottom: '25px', 
                  padding: '20px', 
                  border: '1px solid #dee2e6', 
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa'
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                    <div>
                      <strong>Return ID:</strong> {returnRecord.return_id}
                    </div>
                    <div>
                      <strong>Date:</strong> {new Date(returnRecord.return_date).toLocaleDateString()}
                    </div>
                    <div>
                      <strong>Reason:</strong> {returnRecord.return_reason}
                    </div>
                    <div>
                      <strong>Method:</strong> {returnRecord.refund_method}
                    </div>
                    <div>
                      <strong>Refund Amount:</strong> ₱{parseFloat(returnRecord.refund_amount).toFixed(2)}
                    </div>
                    <div>
                      <strong>Restocked:</strong> {returnRecord.restocked ? 'Yes' : 'No'}
                    </div>
                  </div>

                  {returnRecord.photo_proof && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong>Photo Proof:</strong>
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={`http://localhost:5000${returnRecord.photo_proof}`}
                          alt="Return Proof"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '300px', 
                            borderRadius: '8px',
                            border: '1px solid #ddd'
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {returnRecord.items && returnRecord.items.length > 0 && (
                    <div>
                      <strong>Returned Items:</strong>
                      <table style={{ 
                        width: '100%', 
                        marginTop: '10px', 
                        borderCollapse: 'collapse',
                        backgroundColor: 'white'
                      }}>
                        <thead>
                          <tr style={{ backgroundColor: '#e9ecef' }}>
                            <th style={{ padding: '10px', textAlign: 'left', border: '1px solid #dee2e6' }}>Product</th>
                            <th style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>Qty</th>
                            <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #dee2e6' }}>Price</th>
                            <th style={{ padding: '10px', textAlign: 'right', border: '1px solid #dee2e6' }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {returnRecord.items.map((item, idx) => (
                            <tr key={idx}>
                              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{item.product_name}</td>
                              <td style={{ padding: '10px', textAlign: 'center', border: '1px solid #dee2e6' }}>{item.quantity}</td>
                              <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #dee2e6' }}>₱{parseFloat(item.price).toFixed(2)}</td>
                              <td style={{ padding: '10px', textAlign: 'right', border: '1px solid #dee2e6' }}>₱{parseFloat(item.subtotal).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {returnRecord.additional_notes && (
                    <div style={{ marginTop: '15px' }}>
                      <strong>Notes:</strong> {returnRecord.additional_notes}
                    </div>
                  )}

                  <div style={{ marginTop: '15px', fontSize: '0.9rem', color: '#666' }}>
                    <strong>Processed by:</strong> {returnRecord.processed_by}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button onClick={() => setIsViewReturnsModalOpen(false)} className="cancel-btn">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrdersPage;
