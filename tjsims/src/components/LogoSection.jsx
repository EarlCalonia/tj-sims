import React from 'react';
import '../styles/App.css';
import loginLogo from '../assets/login_logo.JPG';

const LogoSection = () => (
  <div className="logo-section">
    <img src={loginLogo} alt="TJC Auto Supply Logo" className="logo-img" />
  </div>
);

export default LogoSection;
