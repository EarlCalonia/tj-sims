import React from 'react';
import { BsArrowRight } from 'react-icons/bs';

const RecentSales = () => {
  const salesData = [
    { 
      id: 1,
      date: '2025-10-02',
      product: 'Bosch Spark Plug ',
      quantity: 5,
      total: '₱ 3,750.00',
      status: 'Paid'
    },
    { 
      id: 2,
      date: '2025-10-02',
      product: 'Brembo Brake Pads(Front)',
      quantity: 2,
      total: '₱ 5,200.00',
      status: 'Paid'
    },
    { 
      id: 3,
      date: '2025-10-01',
      product: 'Mobil 1 Engine Oil 5W-30(1L)',
      quantity: 12,
      total: '₱ 8,400.00',
      status: 'Paid'
    },
    { 
      id: 4,
      date: '2025-10-01',
      product: 'K&N Air Filter',
      quantity: 3,
      total: '₱ 6,750.00',
      status: 'Pending'
    },
    { 
      id: 5,
      date: '2025-09-30',
      product: 'NGK Ignition Coil',
      quantity: 4,
      total: '₱ 12,000.00',
      status: 'Paid'
    },
  ];

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Recent Sales Transactions</h3>
        <button className="view-all-btn">
          View All <BsArrowRight />
        </button>
      </div>
      <div className="recent-sales">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product Name</th>
              <th className="text-center">Qty</th>
              <th className="text-end">Total Sales</th>
              <th className="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale) => (
              <tr key={sale.id}>
                <td>{formatDate(sale.date)}</td>
                <td>{sale.product}</td>
                <td className="text-center">{sale.quantity}</td>
                <td className="text-end">{sale.total}</td>
                <td className="text-center">
                  <span className={`status-badge ${getStatusClass(sale.status)}`}>
                    {sale.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const InventoryAlerts = () => {
  const lowStockItems = [
    { 
      id: 1,
      name: 'Bosch Spark Plug (4 pcs)',
      remaining: 5,
      threshold: 10
    },
    { 
      id: 2,
      name: 'Brembo Brake Pads(Front)',
      remaining: 3,
      threshold: 5
    },
    { 
      id: 3,
      name: 'Mobil 1 Engine Oil 5W-30(1L)',
      remaining: 8,
      threshold: 15
    },
    { 
      id: 4,
      name: 'K&N Air Filter',
      remaining: 4,
      threshold: 8
    },
    { 
      id: 5,
      name: 'NGK Ignition Coil',
      remaining: 2,
      threshold: 5
    },
  ];

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Inventory Alerts</h3>
        <button className="view-all-btn">
          View All <BsArrowRight />
        </button>
      </div>
      <div className="inventory-alerts">
        {lowStockItems.map((item) => (
          <div key={item.id} className="alert-item">
            <div className="alert-icon">!</div>
            <div className="alert-details">
              <h4>{item.name}</h4>
              <div className="stock-info">
                <span className="remaining">{item.remaining} items left</span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{
                      width: `${(item.remaining / item.threshold) * 100}%`,
                      backgroundColor: item.remaining <= 3 ? '#ef4444' : '#f59e0b'
                    }}
                  ></div>
                </div>
                <span className="threshold">Threshold: {item.threshold}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SalesReportPreview = () => (
  <div className="dashboard-card">
    <div className="card-header">
      <h3>Sales Report Preview</h3>
      <button className="view-all-btn">
        View Report <BsArrowRight />
      </button>
    </div>
    <div className="sales-report">
      <div className="report-summary">
        <div className="summary-item">
          <span>Total Sales</span>
          <strong>₱ 350,000.00</strong>
        </div>
        <div className="summary-item">
          <span>Orders</span>
          <strong>1,250</strong>
        </div>
        <div className="summary-item">
          <span>Avg. Order Value</span>
          <strong>₱ 2,800.00</strong>
        </div>
      </div>
      <div className="report-chart">
        <div className="chart-placeholder">
          [Sales Chart Placeholder]
        </div>
      </div>
    </div>
  </div>
);

const DailySales = () => (
  <div className="dashboard-card">
    <div className="card-header">
      <h3>Daily Sales (Last 7 days)</h3>
      <div className="time-filter">
        <button className="active">Week</button>
        <button>Month</button>
        <button>Year</button>
      </div>
    </div>
    <div className="daily-sales">
      <div className="chart-placeholder">
        [Daily Sales Chart Placeholder]
      </div>
      <div className="sales-stats">
        <div className="stat">
          <span>Total Sales</span>
          <strong>₱ 250,000.00</strong>
        </div>
        <div className="stat">
          <span>Orders</span>
          <strong>89</strong>
        </div>
      </div>
    </div>
  </div>
);

const DashboardSections = () => {
  return (
    <div className="dashboard-sections">
      <div className="dashboard-row">
        <div className="dashboard-col wide">
          <RecentSales />
        </div>
        <div className="dashboard-col narrow">
          <InventoryAlerts />
        </div>
      </div>
      <div className="dashboard-row">
        <div className="dashboard-col">
          <SalesReportPreview />
        </div>
        <div className="dashboard-col">
          <DailySales />
        </div>
      </div>
    </div>
  );
};

export default DashboardSections;
