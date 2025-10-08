import React from 'react';

const StatCard = ({ title, value, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-info">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value" style={{ color }}>{value}</h3>
    </div>
  </div>
);

const DashboardStats = () => {
  const stats = [
    { 
      title: "Today's Sales", 
      value: '₱ 50,000.00', 
      color: '#28a745' // Green for Today's Sales
    },
    { 
      title: 'Total Sales This Week', 
      value: '₱ 350,000.00', 
      color: '#0571d3' // Blue for Total Sales This Week
    },
    { 
      title: 'Low Stock Items', 
      value: '24', 
      color: '#dc3545' // Red for Low Stock Items
    },
    { 
      title: 'Pending Orders', 
      value: '18', 
      color: '#6f42c1' // Purple for Pending Orders
    },
  ];

  return (
    <div className="dashboard-stats">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default DashboardStats;
