import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import { BsSearch, BsEye, BsPencil } from 'react-icons/bs';
import '../../styles/OrdersPage.css';

// Order Modal Component
const OrderModal = ({ order, isOpen, onClose, onSave }) => {
  const [editPaymentStatus, setEditPaymentStatus] = useState(order?.paymentStatus || '');
  const [editOrderStatus, setEditOrderStatus] = useState(order?.orderStatus || '');

  useEffect(() => {
    if (order) {
      setEditPaymentStatus(order.paymentStatus);
      setEditOrderStatus(order.orderStatus);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editPaymentStatus, editOrderStatus);
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
              <input type="text" value={order.orderId} readOnly className="form-input readonly" />
            </div>

            <div className="form-group">
              <label>Customer Name</label>
              <input type="text" value={order.customerName} readOnly className="form-input readonly" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Current Payment Status</label>
                <input type="text" value={order.paymentStatus} readOnly className="form-input readonly" />
              </div>
              <div className="form-group">
                <label>Current Order Status</label>
                <input type="text" value={order.orderStatus} readOnly className="form-input readonly" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Update Payment Status</label>
                <select value={editPaymentStatus} onChange={(e) => setEditPaymentStatus(e.target.value)} className="form-input">
                  <option value="Paid">Paid</option>
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="form-group">
                <label>Update Order Status</label>
                <select value={editOrderStatus} onChange={(e) => setEditOrderStatus(e.target.value)} className="form-input">
                  <option value="Pending">Pending</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipping">Shipping</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Completed">Completed</option>
                  <option value="Canceled">Canceled</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <h4>Order Items</h4>
              <div className="items-display">
                {order.products && order.products.length > 0 ? (
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
                        {order.products.map((product, index) => (
                          <tr key={index} className="item-row">
                            <td className="item-quantity">
                              <span className="quantity-badge">{product.quantity}</span>
                            </td>
                            <td className="item-name">
                              <span className="product-name-text">{product.name}</span>
                            </td>
                            <td className="item-price">
                              <span className="price-text">₱{product.price ? product.price.toLocaleString() : '0'}</span>
                            </td>
                          </tr>
                        ))}
                        <tr className="item-total-row">
                          <td colSpan="2" className="total-label-cell">
                            <strong>Total</strong>
                          </td>
                          <td className="total-amount-cell">
                            <strong className="final-total">₱{order.totalAmount ? order.totalAmount.toLocaleString() : '0'}</strong>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-items-message">
                    <p>No items found for this order.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="form-section">
              <h4>Customer & Delivery Information</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Number</label>
                  <input type="text" value={order.customerContact} readOnly className="form-input readonly" />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <input type="text" value={order.paymentMethod} readOnly className="form-input readonly" />
                </div>
              </div>
              <div className="form-group">
                <label>Delivery Address</label>
                <textarea value={order.customerAddress} readOnly className="form-input readonly" rows="2" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Shipping Option</label>
                  <input type="text" value={order.shippingOption} readOnly className="form-input readonly" />
                </div>
                <div className="form-group">
                  <label>Order Date</label>
                  <input type="text" value={order.orderDate} readOnly className="form-input readonly" />
                </div>
              </div>
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            <button type="submit" className="confirm-btn">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderId: 'ORD-001',
      customerName: 'John Doe',
      customerContact: '+63 912 345 6789',
      customerAddress: '123 Main St, Manila, Philippines',
      orderDate: '2024-01-15',
      productList: 'Engine Oil Filter, Brake Pad Set',
      paymentStatus: 'Paid',
      orderStatus: 'Completed',
      paymentMethod: 'Credit Card',
      shippingOption: 'Standard Shipping (3-5 days)',
      totalAmount: 1650,
      products: [
        { name: 'Engine Oil Filter', quantity: 1, price: 450 },
        { name: 'Brake Pad Set', quantity: 1, price: 1200 }
      ]
    },
    {
      id: 2,
      orderId: 'ORD-002',
      customerName: 'Jane Smith',
      customerContact: '+63 923 456 7890',
      customerAddress: '456 Oak Ave, Quezon City, Philippines',
      orderDate: '2024-01-14',
      productList: 'Shock Absorber',
      paymentStatus: 'Cash on Delivery',
      orderStatus: 'Processing',
      paymentMethod: 'Cash on Delivery',
      shippingOption: 'Express Shipping (1-2 days)',
      totalAmount: 3500,
      products: [
        { name: 'Shock Absorber', quantity: 1, price: 3500 }
      ]
    },
    {
      id: 3,
      orderId: 'ORD-003',
      customerName: 'Mike Johnson',
      customerContact: '+63 934 567 8901',
      customerAddress: '789 Pine St, Makati, Philippines',
      orderDate: '2024-01-13',
      productList: 'Radiator Hose, CV Joint Boot',
      paymentStatus: 'Paid',
      orderStatus: 'Shipping',
      paymentMethod: 'PayPal',
      shippingOption: 'Standard Shipping (3-5 days)',
      totalAmount: 1000,
      products: [
        { name: 'Radiator Hose', quantity: 1, price: 680 },
        { name: 'CV Joint Boot', quantity: 1, price: 320 }
      ]
    },
    {
      id: 4,
      orderId: 'ORD-004',
      customerName: 'Sarah Wilson',
      customerContact: '+63 945 678 9012',
      customerAddress: '321 Elm St, Pasig, Philippines',
      orderDate: '2024-01-12',
      productList: 'Engine Oil Filter',
      paymentStatus: 'Refunded',
      orderStatus: 'Canceled',
      paymentMethod: 'Credit Card',
      shippingOption: 'Standard Shipping (3-5 days)',
      totalAmount: 450,
      products: [
        { name: 'Engine Oil Filter', quantity: 1, price: 450 }
      ]
    },
    {
      id: 5,
      orderId: 'ORD-005',
      customerName: 'David Brown',
      customerContact: '+63 956 789 0123',
      customerAddress: '654 Cedar Ave, Taguig, Philippines',
      orderDate: '2024-01-11',
      productList: 'Brake Pad Set, Shock Absorber',
      paymentStatus: 'Paid',
      orderStatus: 'Out for Delivery',
      paymentMethod: 'GCash',
      shippingOption: 'Express Shipping (1-2 days)',
      totalAmount: 4700,
      products: [
        { name: 'Brake Pad Set', quantity: 1, price: 1200 },
        { name: 'Shock Absorber', quantity: 1, price: 3500 }
      ]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderStatus, setSelectedOrderStatus] = useState('All Order Status');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All Payment Status');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Order status options
  const orderStatuses = ['All Order Status', 'Pending', 'Processing', 'Shipping', 'Out for Delivery', 'Canceled', 'Completed'];

  // Payment status options
  const paymentStatuses = ['All Payment Status', 'Paid', 'Cash on Delivery', 'Refunded', 'Cancelled'];

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.productList.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesOrderStatus = selectedOrderStatus === 'All Order Status' || order.orderStatus === selectedOrderStatus;
    const matchesPaymentStatus = selectedPaymentStatus === 'All Payment Status' || order.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesOrderStatus && matchesPaymentStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);
  const totalFilteredOrders = filteredOrders.length;

  // Calculate stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(order => order.orderStatus === 'Pending').length;
  const paidOrders = orders.filter(order => order.paymentStatus === 'Paid').length;
  const totalRevenue = orders
    .filter(order => order.paymentStatus === 'Paid')
    .reduce((sum, order) => sum + order.totalAmount, 0);

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

  // Handle save changes from modal
  const handleSaveChanges = (newPaymentStatus, newOrderStatus) => {
    if (selectedOrder) {
      const updatedOrders = orders.map(order =>
        order.id === selectedOrder.id
          ? { ...order, paymentStatus: newPaymentStatus, orderStatus: newOrderStatus }
          : order
      );
      setOrders(updatedOrders);
      handleCloseModal();
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
                  <p className="stat-number total-orders">{totalOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Pending Orders</h3>
                  <p className="stat-number pending-orders">{pendingOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Paid Orders</h3>
                  <p className="stat-number paid-orders">{paidOrders}</p>
                </div>
              </div>

              <div className="orders-stat-card">
                <div className="stat-info">
                  <h3>Total Revenue</h3>
                  <p className="stat-number total-revenue">₱{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-section">
              <div className="table-container">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer Name</th>
                      <th>Order Date</th>
                      <th>Product List</th>
                      <th>Payment Status</th>
                      <th>Order Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentOrders.map(order => (
                      <tr key={order.id}>
                        <td className="order-id-cell">{order.orderId}</td>
                        <td>
                          <div className="customer-info">
                            <h4>{order.customerName}</h4>
                          </div>
                        </td>
                        <td>{order.orderDate}</td>
                        <td>
                          <div className="product-list">
                            <span className="product-names" title={order.productList}>
                              {order.productList.length > 50
                                ? `${order.productList.substring(0, 50)}...`
                                : order.productList}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`payment-status-badge ${order.paymentStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span className={`order-status-badge ${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                            {order.orderStatus}
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
      />
    </>
  );
};

export default OrdersPage;
