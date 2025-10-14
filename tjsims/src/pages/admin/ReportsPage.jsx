import React, { useState, useEffect } from 'react';
import Navbar from '../../components/admin/Navbar';
import PDFExportModal from '../../components/admin/PDFExportModal';
import { generateSalesReportPDF, generateInventoryReportPDF } from '../../utils/pdfGenerator';
import { reportsAPI } from '../../utils/api';
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

  // API state
  const [salesData, setSalesData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});

  // Fetch data from API
  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate, currentPage]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      if (activeTab === 'sales') {
        const result = await reportsAPI.getSalesReport(filters);
        setSalesData(result.sales || []);
        setPagination(result.pagination || {});
      } else {
        const result = await reportsAPI.getInventoryReport(filters);
        setInventoryData(result.inventory || []);
        setPagination(result.pagination || {});
      }
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  // Get current data for display
  const getCurrentData = () => {
    if (activeTab === 'sales') {
      // Flatten per-item rows for display (backend already handles pagination)
      const flattenedSales = salesData.flatMap(order =>
        (order.items || []).map(item => ({
          id: `${order.id}-${item.productName}-${item.quantity}-${item.unitPrice}`,
          orderId: order.orderId,
          customerName: order.customerName,
          orderDate: order.orderDate,
          totalAmount: order.totalAmount,
          ...item
        }))
      );
      return flattenedSales;
    } else {
      // Backend already handles pagination, just return the data
      return inventoryData;
    }
  };

  const getTotalItems = () => {
    // Use pagination.total from backend instead of calculating from current page data
    return pagination.total || 0;
  };

  const getTotalPages = () => {
    return pagination.total_pages || Math.ceil(getTotalItems() / itemsPerPage);
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle export functions
  const handleExportCSV = async () => {
    try {
      const filters = {
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate })
      };

      if (activeTab === 'sales') {
        await reportsAPI.exportSalesReportCSV(filters);
      } else {
        await reportsAPI.exportInventoryReportCSV(filters);
      }
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportPDF = () => {
    setShowPDFModal(true);
  };

  const handlePDFExportConfirm = async (exportStartDate, exportEndDate) => {
    try {
      let doc;
      if (activeTab === 'sales') {
        // For sales, we need to fetch all sales data for the date range
        const allSalesResult = await reportsAPI.getSalesReport({
          start_date: exportStartDate,
          end_date: exportEndDate,
          limit: 1000 // Get all records for export
        });
        doc = await generateSalesReportPDF(allSalesResult.sales, exportStartDate, exportEndDate, adminName);
        doc.save(`Sales_Report_${exportStartDate}_to_${exportEndDate}.pdf`);
      } else {
        // For inventory, we need to fetch all inventory data
        const allInventoryResult = await reportsAPI.getInventoryReport({
          limit: 1000 // Get all records for export
        });
        doc = await generateInventoryReportPDF(allInventoryResult.inventory, exportStartDate, exportEndDate, adminName);
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
                {loading ? (
                  <div className="loading-state">
                    <p>Loading report data...</p>
                  </div>
                ) : error ? (
                  <div className="error-state">
                    <p>{error}</p>
                    <button onClick={fetchReportData} className="retry-btn">
                      Retry
                    </button>
                  </div>
                ) : getCurrentData().length === 0 ? (
                  <div className="empty-state">
                    <p>No data available for the selected period</p>
                  </div>
                ) : activeTab === 'sales' ? (
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
                            <span
  className={`stock-status-badge ${(item.stockStatus || '')
    .toLowerCase()
    .replace(/\s+/g, '-')}`}
>
  {item.stockStatus || 'N/A'}
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
                  Showing {pagination.from || 0} to {pagination.to || 0} of {getTotalItems()} {activeTab === 'sales' ? 'sales' : 'products'}
                </div>

                {getTotalPages() > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      Previous
                    </button>

                    {Array.from({ length: getTotalPages() }, (_, index) => index + 1).map(page => (
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
                      disabled={currentPage === getTotalPages()}
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
