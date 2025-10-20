import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../../utils/api';

const StatCard = ({ title, value, color, loading }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-info">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value" style={{ color }}>
        {loading ? 'Loading...' : value}
      </h3>
    </div>
  </div>
);

const DashboardStats = () => {
  const [stats, setStats] = useState({
    todaySales: 0,
    weekSales: 0,
    lowStockItems: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const result = await dashboardAPI.getDashboardStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    { 
      title: "Today's Sales", 
      value: `₱ ${stats.todaySales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      color: '#28a745'
    },
    { 
      title: 'Total Sales This Week', 
      value: `₱ ${stats.weekSales.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      color: '#0571d3'
    },
    { 
      title: 'Low Stock Items', 
      value: stats.lowStockItems.toString(), 
      color: '#dc3545'
    },
    { 
      title: 'Pending Orders', 
      value: stats.pendingOrders.toString(), 
      color: '#6f42c1'
    },
  ];

  return (
    <div className="dashboard-stats">
      {statsConfig.map((stat, index) => (
        <StatCard key={index} {...stat} loading={loading} />
      ))}
    </div>
  );
};

export default DashboardStats;
