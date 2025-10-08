import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { BiUserCircle } from 'react-icons/bi';
import tcjLogo from '../../assets/tcj_logo.png';

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/sales', label: 'Sales' },
    { path: '/admin/inventory', label: 'Inventory' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/products', label: 'Products' },
  ];

  return (
    <div className="admin-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <img src={tcjLogo} alt="TCJ Logo" className="navbar-logo" />
        </div>
        <div className="navbar-nav">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="navbar-profile">
          <div className="profile-icon">
            <BiUserCircle size={24} />
          </div>
          <div className="profile-info">
            <span className="admin-name">Admin</span>
            <span className="admin-role">Administrator</span>
          </div>
          <FaChevronDown size={14} className="chevron-down" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
