import React from 'react';
import Navbar from '../../components/admin/Navbar';
import DashboardStats from '../../components/admin/DashboardStats';
import DashboardSections from '../../components/admin/DashboardSections';
import '../../styles/Admin.css';

const DashboardPage = () => {
  return (
    <div className="admin-layout">
      <Navbar />
      <main className="admin-main">
        <div className="container-fluid">
          <div className="dashboard-header">
            <h1 className="page-title">Dashboard Overview</h1>
            <p className="welcome-message">Welcome Back! Here's what's happening with your store today.</p>
          </div>
          <DashboardStats />
          <DashboardSections />
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
