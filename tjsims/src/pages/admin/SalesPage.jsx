import React, { useState } from 'react';
import { BsCartPlus, BsTrash, BsSearch } from 'react-icons/bs';
import Navbar from '../../components/admin/Navbar';
import '../../styles/SalesPage.css';

const SalesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentOption, setPaymentOption] = useState('Cash');
  const [shippingOption, setShippingOption] = useState('In-Store Pickup');
  const [orderStatus, setOrderStatus] = useState('Processing');
  const [paymentStatus, setPaymentStatus] = useState('Pending');

  // Sample product data
  const [products] = useState([
    { id: 1, name: 'Hydraulic', brand: 'Isuzu', price: 3200, stock: 45 },
    { id: 2, name: 'Auxiliary Fan', brand: 'Isuzu', price: 2050, stock: 8 },
    { id: 3, name: 'Headlight', brand: 'Daewoo', price: 1500, stock: 12 },
    { id: 4, name: 'Thermostat Assembly', brand: 'Kia', price: 850, stock: 78 },
    { id: 5, name: 'Leaf Spring', brand: 'Suzuki', price: 1000, stock: 0 },
    { id: 6, name: 'Bumper', brand: 'Hyundai', price: 2250, stock: 23 },
    { id: 7, name: 'Gearbox', brand: 'Mitsubishi', price: 5300, stock: 30 },
    { id: 8, name: 'Oil Filter', brand: 'Isuzu', price: 750, stock: 60 },
    { id: 9, name: 'Brake Pad Set', brand: 'Isuzu', price: 1600, stock: 18 },
    { id: 10, name: 'Side Mirror', brand: 'Toyota', price: 1800, stock: 27 },
  ]);

  const [quantities, setQuantities] = useState(
    products.reduce((acc, product) => ({ ...acc, [product.id]: 1 }), {})
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleQuantityChange = (productId, change) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: Math.max(1, (prev[productId] || 1) + change)
    }));
  };

  const addToCart = (product) => {
    const quantity = quantities[product.id];
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity }]);
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId, change) => {
    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: Math.max(1, item.quantity + change) }
        : item
    ));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  const clearCustomerInfo = () => {
    setCustomerName('');
    setContactNumber('');
  };

  const confirmSale = () => {
    if (cart.length === 0) {
      alert('Please add items to cart before confirming sale');
      return;
    }
    if (!customerName.trim()) {
      alert('Please enter customer name');
      return;
    }

    alert(`Sale confirmed!\nTotal: ₱${getCartTotal().toLocaleString()}\nCustomer: ${customerName}`);
    clearCart();
    clearCustomerInfo();
  };

  return (
    <div className="sales-layout">
      <Navbar />
      <main className="sales-main">
        <div className="sales-container">
          <div className="sales-header">
            <h1 className="sales-title">Sales Transaction</h1>
            <p className="sales-subtitle">Process customer purchases and manage inventory</p>
          </div>

          <div className="sales-content">
            {/* Products Section */}
            <div className="products-section">
              <div className="products-header">
                <h2>Product List</h2>
                <div className="search-box">
                  <BsSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Brand</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map(product => (
                      <tr key={product.id}>
                        <td>{product.name}</td>
                        <td>{product.brand}</td>
                        <td>₱{product.price.toLocaleString()}</td>
                        <td className={product.stock === 0 ? 'out-of-stock' : ''}>
                          {product.stock}
                        </td>
                        <td>
                          <div className="quantity-controls">
                            <button
                              onClick={() => handleQuantityChange(product.id, -1)}
                              disabled={quantities[product.id] <= 1}
                              className="quantity-btn"
                            >
                              -
                            </button>
                            <span className="quantity-display">
                              {quantities[product.id]}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(product.id, 1)}
                              className="quantity-btn"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td>
                          <button
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                            className="add-to-cart-btn"
                          >
                            <BsCartPlus className="cart-icon" />
                            Add to Cart
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Panel - Shopping Cart & Forms */}
            <div className="right-panel">
              {/* Shopping Cart Section */}
              <div className="cart-section">
                <div className="cart-header">
                  <h2>Shopping Cart</h2>
                </div>

                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="empty-cart">
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    <>
                      {cart.map(item => (
                        <div key={item.id} className="cart-item">
                          <div className="cart-item-info">
                            <h4>{item.name}</h4>
                            <p>{item.brand}</p>
                            <p>₱{item.price.toLocaleString()}</p>
                          </div>
                          <div className="cart-item-quantity">
                            <div className="quantity-controls">
                              <button
                                onClick={() => updateCartQuantity(item.id, -1)}
                                className="quantity-btn"
                              >
                                -
                              </button>
                              <span className="quantity-display">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.id, 1)}
                                className="quantity-btn"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="cart-item-total">
                            ₱{(item.price * item.quantity).toLocaleString()}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="remove-btn"
                          >
                            <BsTrash />
                          </button>
                        </div>
                      ))}
                      <div className="cart-total">
                        <strong>Total: ₱{getCartTotal().toLocaleString()}</strong>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Customer Information Section */}
              <div className="customer-section">
                <h2>Customer Information</h2>
                <div className="customer-info">
                  <div className="info-row">
                    <label>Customer Name:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter customer name"
                      className="info-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>Contact Number:</label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="Enter contact number"
                      className="info-input"
                    />
                  </div>
                  <div className="info-row">
                    <button onClick={clearCustomerInfo} className="clear-info-btn">
                      Clear Information
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment and Shipping Section */}
              <div className="payment-shipping-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Payment Option</label>
                    <select
                      value={paymentOption}
                      onChange={(e) => setPaymentOption(e.target.value)}
                      className="form-select"
                    >
                      <option value="Cash">Cash</option>
                      <option value="GCash">GCash</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Shipping Option</label>
                    <select
                      value={shippingOption}
                      onChange={(e) => setShippingOption(e.target.value)}
                      className="form-select"
                    >
                      <option value="In-Store Pickup">In-Store Pickup</option>
                      <option value="Company Delivery (COD)">Company Delivery (COD)</option>
                      <option value="Company Delivery (GCash)">Company Delivery (GCash)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Order Status Section */}
              <div className="order-status-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Order Status</label>
                    <select
                      value={orderStatus}
                      onChange={(e) => setOrderStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="Processing">Processing</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="form-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                      <option value="Refunded">Refunded</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="action-buttons-right">
            <button onClick={confirmSale} className="confirm-btn">
              Confirm Sale
            </button>
            <button onClick={clearCart} className="clear-cart-btn">
              Clear Cart
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SalesPage;
