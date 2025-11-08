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

const ProductMovement = () => {
  const [fastMoving, setFastMoving] = useState([]);
  const [slowMoving, setSlowMoving] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [fastResult, slowResult] = await Promise.all([
        dashboardAPI.getFastMovingProducts(),
        dashboardAPI.getSlowMovingProducts()
      ]);
      if (fastResult.success) setFastMoving(fastResult.data);
      if (slowResult.success) setSlowMoving(slowResult.data);
    } catch (error) {
      console.error('Error fetching product movement:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-card">
      <div className="card-header">
        <h3>Product Movement</h3>
        <button className="view-all-btn" onClick={() => navigate('/admin/inventory')}>
          View All <BsArrowRight />
        </button>
      </div>
      <div className="product-movement-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
        ) : (
          <>
            {/* Fast Moving Section */}
            <div className="movement-section">
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>Fast Moving (Top 5)</h4>
              {fastMoving.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No data</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fastMoving.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td><strong style={{ color: '#10b981' }}>{product.total_sold}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Slow Moving Section */}
            <div className="movement-section" style={{ marginTop: '24px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#f59e0b' }}>Slow Moving (Bottom 5)</h4>
              {slowMoving.length === 0 ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b' }}>No data</div>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slowMoving.map((product) => (
                      <tr key={product.product_id}>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.stock}</td>
                        <td style={{ color: '#f59e0b' }}>{product.total_sold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
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
  const [dailySales, setDailySales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [rangeLabel, setRangeLabel] = useState('Daily'); // Daily | Weekly | Monthly

  useEffect(() => {
    fetchSalesPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate, rangeLabel]);

  const fetchSalesPreview = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        period: !startDate && !endDate ? 'week' : undefined,
        ...(startDate ? { start_date: startDate } : {}),
        ...(endDate ? { end_date: endDate } : {}),
        granularity: rangeLabel === 'Monthly' ? 'month' : rangeLabel === 'Weekly' ? 'week' : 'day'
      };

      const result = await dashboardAPI.getDailySales(params);
      if (result.success) setDailySales(result.data || []);
      else setError('Failed to fetch sales preview');
    } catch (error) {
      console.error('Error fetching sales preview:', error);
      setError('Error loading sales preview');
    } finally {
      setLoading(false);
    }
  };

  const getTrendChartData = () => {
    const labels = dailySales.map(d => {
      const dt = new Date(d.date);
      if (rangeLabel === 'Monthly') return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (rangeLabel === 'Weekly') return `Week of ${dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
      return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });
    const data = dailySales.map(d => parseFloat(d.total || 0));
    return {
      labels,
      datasets: [{
        label: 'Sales Trend',
        data,
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
        <div className="report-controls" style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 4 }}>From</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 4 }}>To</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#334155', marginBottom: 4 }}>Range Label</label>
            <select value={rangeLabel} onChange={(e) => setRangeLabel(e.target.value)} className="date-input">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
        <div className="report-summary">
          <div className="summary-item">
            <span>Total Sales</span>
            <strong>₱ {(dailySales.reduce((s, d) => s + (parseFloat(d.total || 0)), 0)).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="summary-item">
            <span>Orders</span>
            <strong>{dailySales.reduce((s, d) => s + (parseInt(d.orders || 0)), 0)}</strong>
          </div>
          <div className="summary-item">
            <span>Avg. Order Value</span>
            <strong>₱ {(() => {
              const total = dailySales.reduce((s, d) => s + (parseFloat(d.total || 0)), 0);
              const orders = dailySales.reduce((s, d) => s + (parseInt(d.orders || 0)), 0) || 1;
              return (total / orders).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            })()}</strong>
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
  const [dailySales, setDailySales] = useState([]);
  const [period, setPeriod] = useState('week'); // 'week' | 'month' | 'year'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDailySales();
  }, [period]);

  const fetchDailySales = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await dashboardAPI.getDailySales(period);
      if (result.success) {
        setDailySales(result.data || []);
      } else {
        setError('Failed to fetch daily sales');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Error loading dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = () => {
    const labels = dailySales.map(d => {
      const dt = new Date(d.date);
      if (period === 'year') return dt.toLocaleDateString('en-US', { month: 'short' });
      if (period === 'month') return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return dt.toLocaleDateString('en-US', { weekday: 'short' });
    });
    const data = dailySales.map(d => parseFloat(d.total || 0));
    return {
      labels,
      datasets: [{
        label: 'Daily Sales (₱)',
        data,
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
        <h3>Sales ({period === 'week' ? 'Last 7 days' : period === 'month' ? 'Last 30 days' : 'Last 12 months'})</h3>
        <div className="time-filter">
          <button className={period === 'week' ? 'active' : ''} onClick={() => setPeriod('week')}>Week</button>
          <button className={period === 'month' ? 'active' : ''} onClick={() => setPeriod('month')}>Month</button>
          <button className={period === 'year' ? 'active' : ''} onClick={() => setPeriod('year')}>Year</button>
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
            <strong>₱ {dailySales.reduce((sum, d) => sum + (parseFloat(d.total || 0)), 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="stat">
            <span>Orders</span>
            <strong>{dailySales.reduce((sum, d) => sum + (parseInt(d.orders || 0)), 0)}</strong>
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
        <div className="dashboard-col">
          <ProductMovement />
        </div>
        <div className="dashboard-col">
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
