import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaChevronDown } from 'react-icons/fa';
import { BiUserCircle } from 'react-icons/bi';
import tcjLogo from '../../assets/tcj_logo.png';
import { authAPI } from '../../utils/api';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const username = localStorage.getItem('username') || 'Admin';
  const role = localStorage.getItem('userRole') || 'Administrator';
  const avatar = localStorage.getItem('avatar') || '';
  
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);
  
  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard' },
    { path: '/admin/sales', label: 'Sales' },
    { path: '/admin/inventory', label: 'Inventory' },
    { path: '/admin/orders', label: 'Orders' },
    { path: '/admin/reports', label: 'Reports' },
    { path: '/admin/products', label: 'Products' },
  ];

  const handleLogout = async () => {
    try { await authAPI.logout().catch(() => ({})); } catch {}
    localStorage.setItem('isAuthenticated', 'false');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    navigate('/admin/login');
  };

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
        <div className="navbar-profile" ref={dropdownRef}>
          <button className="profile-btn" onClick={() => setOpen(!open)}>
            <div className="profile-icon">
              {(avatar && (role === 'admin' || role === 'staff')) ? (
                <img src={"http://localhost:5000"+ avatar} alt="avatar" style={{ width: 42, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <BiUserCircle size={24} />
              )}
            </div>
            <div className="profile-info">
              <span className="admin-name">{username}</span>
              <span className="admin-role">{role}</span>
            </div>
            <FaChevronDown size={14} className="chevron-down" />
          </button>
          {open && (
            <div className="profile-dropdown">
              <Link to="/admin/settings" className="dropdown-item" onClick={() => setOpen(false)}>Settings</Link>
              <button className="dropdown-item" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
