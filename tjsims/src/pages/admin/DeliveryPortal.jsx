import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import '../../styles/DeliveryPortal.css';
import tcjLogo from '../../assets/tcj_logo.png';
import { salesAPI } from '../../utils/api';

const DeliveryPortal = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const ordersPerPage = 10;

  const riderName = localStorage.getItem('userName') || localStorage.getItem('userEmail') || 'Rider';
  const riderAvatar = localStorage.getItem('userAvatar');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    salesAPI.getSales({ status: 'Processing' })
      .then((list) => {
        const filtered = (list || []).filter(s => {
          const addr = (s.address || '').toLowerCase();
          return addr.includes('pampanga') || addr.includes('bulacan') || addr.includes('manila');
        });
        const mapped = filtered.map(s => ({
          id: s.sale_number,
          saleId: s.id,
          customerName: s.customer_name,
          orderDate: new Date(s.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }),
          productList: 'See details',
          paymentStatus: s.payment_status,
          paymentMethod: s.payment,
          orderStatus: s.status === 'Pending' ? 'Processing' : (s.status === 'Processing' ? 'Out for delivery' : s.status),
          address: s.address || '',
          contact: s.contact || ''
        }));
        if (mounted) setOrders(mapped);
      })
      .catch((e) => setError(e.message))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userAvatar');
    navigate('/admin/login');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePaymentStatusChange = (orderId, value) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, paymentStatus: value } : o));
  };

  const handleOrderStatusChange = async (orderId, newStatus) => {
    const target = orders.find(o => o.id === orderId);
    if (!target) return;
    const backendStatus = newStatus === 'Out for delivery' ? 'Processing' : newStatus;
    try {
      await salesAPI.updateSale(target.saleId, { status: backendStatus });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    } catch (e) {
      alert(`Failed to update status: ${e.message}`);
    }
  };

  const filteredOrders = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return orders.filter(order =>
      order.id.toLowerCase().includes(s) ||
      (order.customerName || '').toLowerCase().includes(s) ||
      (order.productList || '').toLowerCase().includes(s)
    );
  }, [orders, searchTerm]);

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const getPaymentStatusClass = (status) => status === 'Paid' ? 'status-paid' : 'status-unpaid';
  const getOrderStatusClass = (status) => {
    if (status === 'Completed') return 'status-completed';
    if (status === 'Out for delivery') return 'status-delivery';
    return 'status-processing';
  };

  return (
    <div className="delivery-portal">
      <nav className="delivery-navbar">
        <div className="navbar-left">
          <img src={tcjLogo} alt="TJC Logo" className="navbar-logo" />
          <span className="navbar-divider">|</span>
          <span className="navbar-title">Delivery Portal</span>
        </div>
        <div className="navbar-right">
          <div className="rider-profile">
            {riderAvatar ? (
              <img src={riderAvatar} alt="Rider" className="profile-icon" style={{ width: 28, height: 28, borderRadius: '50%' }} />
            ) : (
              <div className="profile-icon">
                <i className="fas fa-user-circle"></i>
              </div>
            )}
            <span className="rider-name">{riderName}</span>
          </div>
          <span className="navbar-divider">|</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="delivery-container">
        <div className="delivery-header">
          <h1 className="delivery-title">My Delivery Orders</h1>
          <p className="delivery-subtitle">Orders assigned for delivery today. Update status as you complete deliveries.</p>
        </div>

        <div className="search-section">
          <div className="delivery-search-box">
            <input type="text" placeholder="Search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="delivery-search-input" />
            <button className="delivery-search-btn" type="button">
              <BsSearch className="delivery-search-icon" />
            </button>
          </div>
        </div>

        <div className="delivery-table-section">
          <table className="delivery-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer Name</th>
                <th>Product List</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan="6" style={{ padding: 20 }}>Loading...</td></tr>
              )}
              {error && !loading && (
                <tr><td colSpan="6" style={{ padding: 20 }}>{error}</td></tr>
              )}
              {!loading && !error && currentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">{order.id}</td>
                  <td>{order.customerName}</td>
                  <td className="product-list">{order.productList}</td>
                  <td>
                    {order.paymentStatus === 'Unpaid' ? (
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentStatusChange(order.id, e.target.value)}
                        className={`status-edit-select status-${order.paymentStatus.toLowerCase()}`}
                      >
                        <option value="Unpaid">Unpaid (COD)</option>
                        <option value="Paid">Paid (COD)</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${getPaymentStatusClass(order.paymentStatus)}`}>
                        {`${order.paymentStatus} (${order.paymentMethod})`}
                      </span>
                    )}
                  </td>
                  <td>
                    {order.orderStatus !== 'Completed' ? (
                      <select
                        value={order.orderStatus}
                        onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                        className={`status-edit-select status-${order.orderStatus.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <option value="Processing">Processing</option>
                        <option value="Out for delivery">Out for delivery</option>
                        <option value="Completed">Completed</option>
                      </select>
                    ) : (
                      <span className={`status-badge ${getOrderStatusClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    )}
                  </td>
                  <td>
                    <button className="view-btn" onClick={() => handleViewOrder(order)} title="View Details">
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-footer">
          <div className="showing-info">
            Showing {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="pagination">
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="pagination-btn">Previous</button>
            {[...Array(totalPages)].map((_, index) => (
              <button key={index + 1} onClick={() => handlePageChange(index + 1)} className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}>{index + 1}</button>
            ))}
            <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="pagination-btn">Next</button>
          </div>
        </div>
      </div>

      {isModalOpen && selectedOrder && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details - {selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row"><span className="detail-label">Customer Name:</span><span className="detail-value">{selectedOrder.customerName}</span></div>
              <div className="detail-row"><span className="detail-label">Contact Number:</span><span className="detail-value">{selectedOrder.contact}</span></div>
              <div className="detail-row"><span className="detail-label">Delivery Address:</span><span className="detail-value">{selectedOrder.address}</span></div>
              <div className="detail-row"><span className="detail-label">Order Date:</span><span className="detail-value">{selectedOrder.orderDate}</span></div>
              <div className="detail-row"><span className="detail-label">Product List:</span><span className="detail-value">{selectedOrder.productList}</span></div>
              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus)}`}>
                  {selectedOrder.paymentStatus === 'Paid' ? `Paid (${selectedOrder.paymentMethod})` : `Unpaid (${selectedOrder.paymentMethod})`}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Status:</span>
                <span className={`status-badge ${getOrderStatusClass(selectedOrder.orderStatus)}`}>{selectedOrder.orderStatus}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPortal;
