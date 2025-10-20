import React, { useState, useEffect } from 'react';
import { BsArrowRight } from 'react-icons/bs';
import { dashboardAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const RecentSales = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecentSales();
  }, []);

  const fetchRecentSales = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getRecentSales();
      if (result.success) {
        setSalesData(result.data);
      }
    } catch (error) {
      console.error('Error fetching recent sales:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <button className="view-all-btn" onClick={() => navigate('/admin/orders')}>
          View All <BsArrowRight />
        </button>
      </div>
      <div className="recent-sales">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : salesData.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No recent sales</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Products</th>
                <th className="text-end">Total Sales</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {salesData.map((sale) => (
                <tr key={sale.id}>
                  <td>{formatDate(sale.date)}</td>
                  <td>{sale.customer_name}</td>
                  <td>{sale.products}</td>
                  <td className="text-end">₱ {parseFloat(sale.total).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className="text-center">
                    <span className={`status-badge ${getStatusClass(sale.payment)}`}>
                      {sale.payment}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const InventoryAlerts = () => {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLowStockItems();
  }, []);

  const fetchLowStockItems = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getLowStockItems();
      if (result.success) {
        setLowStockItems(result.data);
      }
    } catch (error) {
      console.error('Error fetching low stock items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Inventory Alerts</h3>
        <button className="view-all-btn" onClick={() => navigate('/admin/inventory')}>
          View All <BsArrowRight />
        </button>
      </div>
      <div className="inventory-alerts">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : lowStockItems.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>No low stock items</div>
        ) : (
          lowStockItems.map((item) => (
            <div key={item.product_id} className="alert-item">
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
          ))
        )}
      </div>
    </div>
  );
};

const SalesReportPreview = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats only (sales-trend endpoint doesn't exist yet)
      const statsResult = await dashboardAPI.getDashboardStats();

      if (statsResult.success) {
        setDashboardStats(statsResult.data);
      } else {
        setError('Failed to fetch dashboard statistics');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Process API data for trend chart (using sample data until backend provides trend data)
  const getTrendChartData = () => {
    // Sample data - replace with real API data when backend endpoint is available
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
      datasets: [{
        label: 'Sales Trend',
        data: [45000, 52000, 48000, 61000, 58000, 67000, 73000],
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
      }]
    };
  };

  const trendChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₱${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + (value / 1000) + 'k';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Sales Report Preview</h3>
        <button
          className="view-all-btn"
          onClick={() => navigate('/admin/reports')}
        >
          View Report <BsArrowRight />
        </button>
      </div>

      <div className="sales-report">
        <div className="report-summary">
          <div className="summary-item">
            <span>Total Sales</span>
            <strong>₱ {dashboardStats?.totalSales?.toLocaleString() || '0.00'}</strong>
          </div>
          <div className="summary-item">
            <span>Orders</span>
            <strong>{dashboardStats?.totalOrders || 0}</strong>
          </div>
          <div className="summary-item">
            <span>Avg. Order Value</span>
            <strong>₱ {dashboardStats?.averageOrderValue?.toLocaleString() || '0.00'}</strong>
          </div>
        </div>

        <div className="report-chart">
          {loading ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              Loading chart...
            </div>
          ) : error ? (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
              {error}
            </div>
          ) : (
            <div className="chart-container" style={{ height: '180px', position: 'relative' }}>
              <Line data={getTrendChartData()} options={trendChartOptions} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


const DailySales = () => {
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailySales();
  }, []);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      setError(null);
      // Use getDashboardStats instead of non-existent getDailySales
      const result = await dashboardAPI.getDashboardStats();
      if (result.success) {
        setDashboardStats(result.data);
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Generate sample daily sales data for the chart (can be replaced with real API data later)
  const getChartData = () => {
    // Sample data - replace with real API data when backend endpoint is available
    return {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
        label: 'Daily Sales (₱)',
        data: [12500, 15200, 13800, 18900, 22100, 25600, 18200],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `₱${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '₱' + value.toLocaleString();
          }
        },
        grid: {
          display: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
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
        {loading ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading chart...
          </div>
        ) : error ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'red' }}>
            {error}
          </div>
        ) : (
          <div className="chart-container" style={{ height: '200px', position: 'relative' }}>
            <Bar data={getChartData()} options={chartOptions} />
          </div>
        )}
        <div className="sales-stats">
          <div className="stat">
            <span>Total Sales</span>
            <strong>₱ {dashboardStats?.totalSales?.toLocaleString() || '250,000.00'}</strong>
          </div>
          <div className="stat">
            <span>Orders</span>
            <strong>{dashboardStats?.totalOrders || 89}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

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
