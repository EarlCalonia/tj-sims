import React from 'react';
import '../styles/App.css';
import { Link } from 'react-router-dom';

const RecoveryForm = () => (
  <div className="login-form-container">
    <h3 className="login-title">Recover Your Account</h3>
    <p className="login-desc">Enter your email to reset your password</p>
    <form className="login-form">
      <input type="email" placeholder="Email" className="form-control mb-3" required />
      <button type="submit" className="btn btn-primary w-100 mb-2">Send Recovery Link</button>
    </form>
    <div className="login-links">
      <span>Remember your password? </span>
      <Link to="/login" className="recover-link">Back to Login</Link>
    </div>
  </div>
);

export default RecoveryForm;
