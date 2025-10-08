    import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsSearch } from 'react-icons/bs';
import '../../styles/DeliveryPortal.css';
import tcjLogo from '../../assets/tcj_logo.png';

const DeliveryPortal = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Sample delivery orders data
  const [orders, setOrders] = useState([
    {
      id: 'ORD-001',
      customerName: 'John Smith',
      orderDate: 'Jan 4, 2024',
      productList: 'Hydrovac x2, Air Cleaner x1',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Out for delivery',
      address: '123 Main St, Quezon City',
      contact: '09123456789'
    },
    {
      id: 'ORD-002',
      customerName: 'Sarah Johnson',
      orderDate: 'Jan 4, 2024',
      productList: 'Auxiliary Fan x3',
      paymentStatus: 'Unpaid',
      paymentMethod: 'COD',
      orderStatus: 'Out for delivery',
      address: '456 Market Ave, Manila',
      contact: '09187654321'
    },
    {
      id: 'ORD-003',
      customerName: 'Mike Davis',
      orderDate: 'Jan 17, 2024',
      productList: 'Headlight x2',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '789 Commerce Blvd, Makati',
      contact: '09112233445'
    },
    {
      id: 'ORD-004',
      customerName: 'Emily Brown',
      orderDate: 'Jan 18, 2024',
      productList: 'Thermostat Assembly x1',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '321 Business Park, Pasig',
      contact: '09198765432'
    },
    {
      id: 'ORD-005',
      customerName: 'David Wilson',
      orderDate: 'Jan 19, 2024',
      productList: 'Leaf Spring x2',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '654 Industrial St, Caloocan',
      contact: '09156789012'
    },
    {
      id: 'ORD-011',
      customerName: 'James Martinez',
      orderDate: 'Jan 25, 2024',
      productList: 'Bumper x1',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '987 Auto Lane, Taguig',
      contact: '09134567890'
    },
    {
      id: 'ORD-012',
      customerName: 'Michelle Rodriguez',
      orderDate: 'Jan 26, 2024',
      productList: 'Gearbox x3',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '147 Parts Drive, Parañaque',
      contact: '09145678901'
    },
    {
      id: 'ORD-013',
      customerName: 'Kevin Thompson',
      orderDate: 'Jan 27, 2024',
      productList: 'Oil Filter x7',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '258 Supply Road, Las Piñas',
      contact: '09167890123'
    },
    {
      id: 'ORD-014',
      customerName: 'Nicole Clark',
      orderDate: 'Jan 28, 2024',
      productList: 'Brake Pad Set x10',
      paymentStatus: 'Paid',
      paymentMethod: 'GCash',
      orderStatus: 'Completed',
      address: '369 Dealer Ave, Muntinlupa',
      contact: '09178901234'
    }
  ]);

  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editForm, setEditForm] = useState({
    paymentStatus: '',
    paymentMethod: '',
    orderStatus: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    navigate('/admin/login');
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handlePaymentStatusChange = (orderId, value) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          if (value === 'Paid') {
            return { ...order, paymentStatus: 'Paid', paymentMethod: 'COD' };
          } else {
            return { ...order, paymentStatus: 'Unpaid', paymentMethod: 'COD' };
          }
        }
        return order;
      })
    );
  };

  const handleOrderStatusChange = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order => {
        if (order.id === orderId) {
          return { ...order, orderStatus: newStatus };
        }
        return order;
      })
    );
  };

  const canEditOrder = (order) => {
    // Orders are editable if payment is unpaid OR order status is not completed
    return order.paymentStatus === 'Unpaid' || order.orderStatus !== 'Completed';
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.productList.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getPaymentStatusClass = (status, method) => {
    if (status === 'Paid') return 'status-paid';
    return 'status-unpaid';
  };

  const getOrderStatusClass = (status) => {
    if (status === 'Completed') return 'status-completed';
    if (status === 'Out for delivery') return 'status-delivery';
    return 'status-processing';
  };

  return (
    <div className="delivery-portal">
      {/* Navbar */}
      <nav className="delivery-navbar">
        <div className="navbar-left">
          <img src={tcjLogo}  alt="TJC Logo" className="navbar-logo" />
          <span className="navbar-divider">|</span>
          <span className="navbar-title">Delivery Portal</span>
        </div>
        <div className="navbar-right">
          <div className="rider-profile">
            <div className="profile-icon">
              <i className="fas fa-user-circle"></i>
            </div>
            <span className="rider-name">Rider12</span>
          </div>
          <span className="navbar-divider">|</span>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="delivery-container">
        {/* Header */}
        <div className="delivery-header">
          <h1 className="delivery-title">My Delivery Orders</h1>
          <p className="delivery-subtitle">
            Orders assigned for delivery today. Update status as you complete deliveries.
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-section">
          <div className="delivery-search-box">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="delivery-search-input"
            />
            <button className="delivery-search-btn" type="button">
              <BsSearch className="delivery-search-icon" />
            </button>
          </div>
        </div>

        {/* Orders Table */}
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
              {currentOrders.map((order) => (
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
                      <span className={`status-badge ${getPaymentStatusClass(order.paymentStatus, order.paymentMethod)}`}>
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
                    <button
                      className="view-btn"
                      onClick={() => handleViewOrder(order)}
                      title="View Details"
                    >
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="table-footer">
          <div className="showing-info">
            Showing {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
          </div>
          <div className="pagination">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`pagination-btn ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
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
        </div>
      </div>

      {/* Order Details Modal */}
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
              <div className="detail-row">
                <span className="detail-label">Customer Name:</span>
                <span className="detail-value">{selectedOrder.customerName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Contact Number:</span>
                <span className="detail-value">{selectedOrder.contact}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Delivery Address:</span>
                <span className="detail-value">{selectedOrder.address}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Date:</span>
                <span className="detail-value">{selectedOrder.orderDate}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Product List:</span>
                <span className="detail-value">{selectedOrder.productList}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Payment Status:</span>
                <span className={`status-badge ${getPaymentStatusClass(selectedOrder.paymentStatus, selectedOrder.paymentMethod)}`}>
                  {selectedOrder.paymentStatus === 'Paid' 
                    ? `Paid (${selectedOrder.paymentMethod})`
                    : `Unpaid (${selectedOrder.paymentMethod})`}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Order Status:</span>
                <span className={`status-badge ${getOrderStatusClass(selectedOrder.orderStatus)}`}>
                  {selectedOrder.orderStatus}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="close-modal-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryPortal;
