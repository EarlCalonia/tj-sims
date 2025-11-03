import React, { useState, useEffect } from 'react';
import { BsCartPlus, BsTrash, BsSearch } from 'react-icons/bs';
import Navbar from '../../components/admin/Navbar';
import '../../styles/SalesPage.css';
import { productAPI, salesAPI, inventoryAPI } from '../../utils/api';
import { generateSaleReceipt } from '../../utils/pdfGenerator';

const SalesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [paymentOption, setPaymentOption] = useState('Cash');
  const [shippingOption, setShippingOption] = useState('In-Store Pickup');
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [address, setAddress] = useState('Manila');
  const [addressDetails, setAddressDetails] = useState('');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [gcashRef, setGcashRef] = useState('');

  // New state for API integration
  const [products, setProducts] = useState([]);
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch products and inventory data on component mount
  useEffect(() => {
    fetchProductsAndInventory();
  }, []);

  const fetchProductsAndInventory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch products with inventory data
      const response = await inventoryAPI.getProductsWithInventory();

      // The API returns { success: true, data: { products: [...] } }
      const productsData = response.data?.products || [];

      // The API returns an array of products with inventory info
      const productsWithInventory = productsData.map(product => ({
        ...product,
        stock: product.stock || 0
      }));

      setProducts(productsWithInventory);

      // Create inventory lookup map
      const inventoryMap = {};
      productsWithInventory.forEach(product => {
        inventoryMap[product.product_id] = {
          stock: product.stock || 0,
          reorder_point: product.reorder_point || 10
        };
      });
      setInventory(inventoryMap);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load products and inventory data');
    } finally {
      setLoading(false);
    }
  };

  const [quantities, setQuantities] = useState({});

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

  const addToCart = async (product) => {
    const quantity = quantities[product.product_id] || 1;

    // Check if we have enough stock
    if (product.stock < quantity) {
      alert(`Insufficient stock. Available: ${product.stock}, Requested: ${quantity}`);
      return;
    }

    try {
      // Update inventory first (subtract stock)
      await inventoryAPI.updateStock(product.product_id, -quantity);

      const existingItem = cart.find(item => item.product_id === product.product_id);

      if (existingItem) {
        setCart(cart.map(item =>
          item.product_id === product.product_id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ));
      } else {
        setCart([...cart, {
          product_id: product.product_id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity
        }]);
      }

      // Update local state to reflect stock change
      setProducts(products.map(p =>
        p.product_id === product.product_id
          ? { ...p, stock: p.stock - quantity }
          : p
      ));

      // Update inventory map
      setInventory(prev => ({
        ...prev,
        [product.product_id]: {
          ...prev[product.product_id],
          stock: prev[product.product_id].stock - quantity
        }
      }));

    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    }
  };

  const removeFromCart = async (productId) => {
    const itemToRemove = cart.find(item => item.product_id === productId);
    if (!itemToRemove) return;

    try {
      // Update inventory (add stock back)
      await inventoryAPI.updateStock(productId, itemToRemove.quantity);

      // Remove from cart
      setCart(cart.filter(item => item.product_id !== productId));

      // Update local state to reflect stock change
      setProducts(products.map(p =>
        p.product_id === productId
          ? { ...p, stock: p.stock + itemToRemove.quantity }
          : p
      ));

      // Update inventory map
      setInventory(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          stock: prev[productId].stock + itemToRemove.quantity
        }
      }));

    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Failed to remove item from cart. Please try again.');
    }
  };

  const updateCartQuantity = async (productId, change) => {
    const item = cart.find(item => item.product_id === productId);
    if (!item) return;

    const newQuantity = Math.max(1, item.quantity + change);
    const quantityDifference = newQuantity - item.quantity;

    // If quantity is not changing, return early
    if (quantityDifference === 0) return;

    try {
      // Check stock availability for increases
      if (quantityDifference > 0) {
        const currentStock = inventory[productId]?.stock || 0;
        if (currentStock < quantityDifference) {
          alert(`Insufficient stock. Available: ${currentStock}, Needed: ${quantityDifference}`);
          return;
        }
      }

      // Update inventory
      await inventoryAPI.updateStock(productId, -quantityDifference);

      // Update cart
      setCart(cart.map(cartItem =>
        cartItem.product_id === productId
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      ));

      // Update local state to reflect stock change
      setProducts(products.map(p =>
        p.product_id === productId
          ? { ...p, stock: p.stock - quantityDifference }
          : p
      ));

      // Update inventory map
      setInventory(prev => ({
        ...prev,
        [productId]: {
          ...prev[productId],
          stock: prev[productId].stock - quantityDifference
        }
      }));

    } catch (error) {
      console.error('Error updating cart quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = async () => {
    if (cart.length === 0) return;

    try {
      // Add all stock back for each item in cart
      for (const item of cart) {
        await inventoryAPI.updateStock(item.product_id, item.quantity);

        // Update local state to reflect stock change
        setProducts(products.map(p =>
          p.product_id === item.product_id
            ? { ...p, stock: p.stock + item.quantity }
            : p
        ));

        // Update inventory map
        setInventory(prev => ({
          ...prev,
          [item.product_id]: {
            ...prev[item.product_id],
            stock: prev[item.product_id].stock + item.quantity
          }
        }));
      }

      // Clear the cart
      setCart([]);

    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  const clearCustomerInfo = () => {
    setLastName('');
    setFirstName('');
    setMiddleName('');
    setContactNumber('');
    setAddress('Manila');
    setAddressDetails('');
    setTenderedAmount('');
    setGcashRef('');
  };

  const confirmSale = async () => {
    if (cart.length === 0) {
      alert('Please add items to cart before confirming sale');
      return;
    }
    const fullName = `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ').trim();
    if (!lastName.trim() || !firstName.trim()) {
      alert('Please enter customer last and first name');
      return;
    }
    const total = getCartTotal();
    const payAmt = parseFloat(tenderedAmount);
    if (Number.isNaN(payAmt) || payAmt < total) {
      alert('Customer Payment Amount must be a valid decimal and at least equal to the cart total.');
      return;
    }

    try {
      setSubmitting(true);

      // Enforce shipping option rule
      if (getCartTotal() < 5000 && shippingOption !== 'In-Store Pickup') {
        setShippingOption('In-Store Pickup');
      }

      const saleData = {
        customer_name: fullName,
        contact: contactNumber,
        payment: paymentOption,
        payment_status: paymentStatus,
        status: orderStatus,
        address: addressDetails ? `${addressDetails}, ${address}` : address,
        total: getCartTotal(),
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.name,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity
        }))
      };

      const result = await salesAPI.createSale(saleData);
      const saleNo = result?.data?.sale_number || 'N/A';

      // Auto-generate and download receipt
      try {
        const doc = await generateSaleReceipt({
          saleNumber: saleNo,
          customerName: fullName,
          items: cart,
          totalAmount: getCartTotal(),
          paymentMethod: paymentOption,
          tenderedAmount: parseFloat(tenderedAmount || 0),
          changeAmount: Math.max(0, parseFloat(tenderedAmount || 0) - getCartTotal()),
          address: addressDetails ? `${addressDetails}, ${address}` : address,
          shippingOption,
          createdAt: new Date()
        });
        doc.save(`${saleNo}_receipt.pdf`);
      } catch (e) {
        console.error('Failed to generate receipt:', e);
      }

      alert(`Sale confirmed successfully!\nSale Number: ${saleNo}\nTotal: ₱${getCartTotal().toLocaleString()}\nCustomer: ${fullName}`);
      clearCart();
      clearCustomerInfo();

      // Show refresh indicator and refresh inventory data
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay for visual feedback
      await fetchProductsAndInventory();
      setLoading(false);

    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Failed to create sale. Please try again.');
    } finally {
      setSubmitting(false);
    }
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

          {error && (
            <div className="error-banner">
              <p>{error}</p>
              <button onClick={fetchProductsAndInventory} className="retry-btn">
                Retry
              </button>
            </div>
          )}

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
                {loading ? (
                  <div className="loading-state">
                    <p>Loading products...</p>
                  </div>
                ) : (
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
                        <tr key={product.product_id}>
                          <td>{product.name}</td>
                          <td>{product.brand}</td>
                          <td>₱{product.price.toLocaleString()}</td>
                          <td className={product.stock === 0 ? 'out-of-stock' : ''}>
                            {product.stock}
                          </td>
                          <td>
                            <div className="quantity-controls">
                              <button
                                onClick={() => handleQuantityChange(product.product_id, -1)}
                                disabled={product.stock === 0 || (quantities[product.product_id] || 1) <= 1}
                                className="quantity-btn"
                              >
                                -
                              </button>
                              <span className="quantity-display">
                                {quantities[product.product_id] || 1}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(product.product_id, 1)}
                                disabled={product.stock === 0}
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
                )}
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
                        <div key={item.product_id} className="cart-item">
                          <div className="cart-item-info">
                            <h4>{item.name}</h4>
                            <p>{item.brand}</p>
                            <p>₱{item.price.toLocaleString()}</p>
                          </div>
                          <div className="cart-item-quantity">
                            <div className="quantity-controls">
                              <button
                                onClick={() => updateCartQuantity(item.product_id, -1)}
                                className="quantity-btn"
                              >
                                -
                              </button>
                              <span className="quantity-display">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product_id, 1)}
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
                            onClick={() => removeFromCart(item.product_id)}
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
                    <label>Last Name:</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Enter last name"
                      className="info-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>First Name:</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Enter first name"
                      className="info-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>Middle Name:</label>
                    <input
                      type="text"
                      value={middleName}
                      onChange={(e) => setMiddleName(e.target.value)}
                      placeholder="Enter middle name"
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
                    <label>Address Details:</label>
                    <input
                      type="text"
                      value={addressDetails}
                      onChange={(e) => setAddressDetails(e.target.value)}
                      placeholder="Street/Barangay/City details"
                      className="info-input"
                    />
                  </div>
                  <div className="info-row">
                    <label>Address:</label>
                    <select
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="info-input"
                    >
                      <option value="Manila">Manila</option>
                      <option value="Pampanga">Pampanga</option>
                      <option value="Bulacan">Bulacan</option>
                    </select>
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
                      {/* Enable company delivery only if total >= 5000 */}
                      {getCartTotal() >= 5000 && (
                        <>
                          <option value="Company Delivery (COD)">Company Delivery (COD)</option>
                          <option value="Company Delivery (GCash)">Company Delivery (GCash)</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Customer Payment Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={tenderedAmount}
                      onChange={(e) => setTenderedAmount(e.target.value)}
                      className="form-input"
                      placeholder={paymentOption === 'Cash' ? 'Cash tendered' : 'Amount paid'}
                    />
                  </div>
                  {paymentOption === 'GCash' && (
                    <div className="form-group">
                      <label>GCash Reference Number</label>
                      <input
                        type="text"
                        value={gcashRef}
                        onChange={(e) => setGcashRef(e.target.value)}
                        className="form-input"
                        placeholder="Enter GCash reference"
                      />
                    </div>
                  )}
                  {paymentOption === 'Cash' && (
                    <div className="form-group">
                      <label>Change</label>
                      <input
                        type="text"
                        readOnly
                        value={`₱${Math.max(0, (parseFloat(tenderedAmount || 0) - getCartTotal())).toLocaleString()}`}
                        className="form-input readonly"
                      />
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* Action Buttons - Right Side */}
          <div className="action-buttons-right">
            {(() => {
              const total = getCartTotal();
              const payAmt = parseFloat(tenderedAmount);
              var _isPaymentValid = !Number.isNaN(payAmt) && payAmt >= total;
              window.__sales_isPaymentValid = _isPaymentValid; // minimal debug aid
              return null;
            })()}
            <button
              onClick={confirmSale}
              disabled={submitting || cart.length === 0 || Number.isNaN(parseFloat(tenderedAmount)) || parseFloat(tenderedAmount) < getCartTotal()}
              className="confirm-btn"
            >
              {submitting ? 'Processing...' : 'Confirm Sale'}
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
