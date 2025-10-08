import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RecoveryPage from './pages/RecoveryPage';
import LandingPage from './pages/client/LandingPage';
import Products from './pages/client/Products';
import DashboardPage from './pages/admin/DashboardPage';
import SalesPage from './pages/admin/SalesPage';
import InventoryPage from './pages/admin/InventoryPage';
import OrdersPage from './pages/admin/OrdersPage';
import ReportsPage from './pages/admin/ReportsPage';
import ProductPage from './pages/admin/ProductPage';
import DeliveryPortal from './pages/admin/DeliveryPortal';

// A wrapper component to handle authentication
const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  
  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/products" element={<Products />} />
        <Route path="/order-status" element={<LandingPage />} />
        <Route path="/contact-us" element={<LandingPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<LoginPage />} />
        <Route path="/admin/recover-password" element={<RecoveryPage />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/sales" 
          element={
            <PrivateRoute>
              <SalesPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/orders" 
          element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/inventory" 
          element={
            <PrivateRoute>
              <InventoryPage />
            </PrivateRoute>
          } 
        />
         <Route 
          path="/admin/reports" 
          element={
            <PrivateRoute>
              <ReportsPage />
            </PrivateRoute>
          } 
        />
          <Route 
          path="/admin/products" 
          element={
            <PrivateRoute>
              <ProductPage />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/delivery" 
          element={
            <PrivateRoute>
              <DeliveryPortal />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin" 
          element={
            <PrivateRoute>
              <Navigate to="/admin/dashboard" replace />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
