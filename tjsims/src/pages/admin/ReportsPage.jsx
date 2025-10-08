import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import PDFExportModal from '../../components/admin/PDFExportModal';
import { generateSalesReportPDF, generateInventoryReportPDF } from '../../utils/pdfGenerator';
import { BsDownload, BsFileEarmarkPdf } from 'react-icons/bs';
import '../../styles/ReportsPage.css';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [adminName] = useState('Admin User'); // You can get this from authentication context

  // Mock data for sales report
  const salesData = [
    {
      id: 1,
      orderId: 'ORD-001',
      customerName: 'John Doe',
      orderDate: '2024-01-15',
      items: [
        { productName: 'Engine Oil Filter', quantity: 1, unitPrice: 450, totalPrice: 450 },
        { productName: 'Brake Pad Set', quantity: 2, unitPrice: 600, totalPrice: 1200 }
      ],
      totalAmount: 1650
    },
    {
      id: 2,
      orderId: 'ORD-002',
      customerName: 'Jane Smith',
      orderDate: '2024-01-14',
      items: [
        { productName: 'Shock Absorber', quantity: 1, unitPrice: 3500, totalPrice: 3500 }
      ],
      totalAmount: 3500
    },
    {
      id: 3,
      orderId: 'ORD-003',
      customerName: 'Mike Johnson',
      orderDate: '2024-01-13',
      items: [
        { productName: 'Radiator Hose', quantity: 1, unitPrice: 500, totalPrice: 500 },
        { productName: 'CV Joint Boot', quantity: 1, unitPrice: 500, totalPrice: 500 }
      ],
      totalAmount: 1000
    },
    {
      id: 4,
      orderId: 'ORD-004',
      customerName: 'Sarah Wilson',
      orderDate: '2024-01-12',
      items: [
        { productName: 'Engine Oil Filter', quantity: 1, unitPrice: 450, totalPrice: 450 }
      ],
      totalAmount: 450
    },
    {
      id: 5,
      orderId: 'ORD-005',
      customerName: 'David Brown',
      orderDate: '2024-01-11',
      items: [
        { productName: 'Brake Pad Set', quantity: 2, unitPrice: 600, totalPrice: 1200 },
        { productName: 'Shock Absorber', quantity: 2, unitPrice: 1750, totalPrice: 3500 }
      ],
      totalAmount: 4700
    }
  ];

  // Mock data for inventory report
  const inventoryData = [
    {
      id: 1,
      productName: 'Engine Oil Filter',
      category: 'Filters',
      brand: 'Bosch',
      currentStock: 25,
      stockStatus: 'In Stock'
    },
    {
      id: 2,
      productName: 'Brake Pad Set',
      category: 'Brakes',
      brand: 'Brembo',
      currentStock: 8,
      stockStatus: 'Low Stock'
    },
    {
      id: 3,
      productName: 'Shock Absorber',
      category: 'Suspension',
      brand: 'KYB',
      currentStock: 0,
      stockStatus: 'Out of Stock'
    },
    {
      id: 4,
      productName: 'Radiator Hose',
      category: 'Cooling System',
      brand: 'Gates',
      currentStock: 15,
      stockStatus: 'In Stock'
    },
    {
      id: 5,
      productName: 'CV Joint Boot',
      category: 'Drive Train',
      brand: 'Moog',
      currentStock: 12,
      stockStatus: 'In Stock'
    }
  ];

  // Pagination logic - modified to handle flattened sales data
  const getCurrentData = () => {
    if (activeTab === 'sales') {
      // Flatten sales data for display
      const flattenedSales = salesData.flatMap(order =>
        order.items.map(item => ({
          id: `${order.id}-${item.productName}`,
          orderId: order.orderId,
          customerName: order.customerName,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          ...item
        }))
      );
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return flattenedSales.slice(startIndex, endIndex);
    } else {
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return inventoryData.slice(startIndex, endIndex);
    }
  };

  const getTotalItems = () => {
    if (activeTab === 'sales') {
      return salesData.reduce((total, order) => total + order.items.length, 0);
    } else {
      return inventoryData.length;
    }
  };

  const totalPages = Math.ceil(getTotalItems() / itemsPerPage);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle export functions
  const handleExportCSV = () => {
    // CSV export logic would go here
    console.log('Exporting CSV...');
  };

  const handleExportPDF = () => {
    setShowPDFModal(true);
  };

  const handlePDFExportConfirm = async (exportStartDate, exportEndDate) => {
    try {
      let doc;
      if (activeTab === 'sales') {
        doc = await generateSalesReportPDF(salesData, exportStartDate, exportEndDate, adminName);
        doc.save(`Sales_Report_${exportStartDate}_to_${exportEndDate}.pdf`);
      } else {
        doc = await generateInventoryReportPDF(inventoryData, exportStartDate, exportEndDate, adminName);
        doc.save(`Inventory_Report_${exportStartDate}_to_${exportEndDate}.pdf`);
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Reset to first page when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <>
      <div className="reports-layout">
        <Navbar />
        <main className="reports-main">
          <div className="reports-container">

            {/* Header Section */}
            <div className="reports-header">
              <h1 className="reports-title">Reports</h1>
              <p className="reports-subtitle">Generate and export sales and inventory reports.</p>
            </div>

            {/* Tab System */}
            <div className="reports-tabs">
              <button
                className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                onClick={() => setActiveTab('sales')}
              >
                Sales Report
              </button>
              <button
                className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory Report
              </button>
            </div>

            {/* Controls Section */}
            <div className="reports-controls">
              <div className="date-range-section">
                <div className="date-input-group">
                  <label htmlFor="start-date">From</label>
                  <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="date-input"
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">To</label>
                  <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <div className="export-buttons">
                <button onClick={handleExportCSV} className="export-btn csv-btn">
                  <BsDownload className="export-icon" />
                  Export CSV
                </button>
                <button onClick={handleExportPDF} className="export-btn pdf-btn">
                  <BsFileEarmarkPdf className="export-icon" />
                  Export PDF
                </button>
              </div>
            </div>

            {/* Reports Table */}
            <div className="reports-table-section">
              <div className="table-container">
                {activeTab === 'sales' ? (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer Name</th>
                        <th>Product Name</th>
                        <th>Quantity Sold</th>
                        <th>Unit Price</th>
                        <th>Total Sales</th>
                        <th>Order Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentData().map(item => (
                        <tr key={item.id}>
                          <td className="order-id-cell">{item.orderId}</td>
                          <td>{item.customerName}</td>
                          <td>{item.productName}</td>
                          <td>{item.quantity}</td>
                          <td className="amount-cell">₱{item.unitPrice.toLocaleString()}</td>
                          <td className="amount-cell">₱{item.totalPrice.toLocaleString()}</td>
                          <td>{item.orderDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="reports-table">
                    <thead>
                      <tr>
                        <th>Product Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Current Stock</th>
                        <th>Stock Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getCurrentData().map(item => (
                        <tr key={item.id}>
                          <td className="product-name-cell">{item.productName}</td>
                          <td>{item.category}</td>
                          <td>{item.brand}</td>
                          <td className="stock-cell">{item.currentStock}</td>
                          <td>
                            <span className={`stock-status-badge ${item.stockStatus.toLowerCase().replace(/\s+/g, '-')}`}>
                              {item.stockStatus}
                            </span>
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
                  Showing {getTotalItems() > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, getTotalItems())} of {getTotalItems()} {activeTab === 'sales' ? 'items' : 'products'}
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

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onExport={handlePDFExportConfirm}
        reportType={activeTab}
      />
    </>
  );
};

export default ReportsPage;
