import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/api';
import '../styles/App.css';

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      localStorage.setItem('isAuthenticated', 'false');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setError('');
      const result = await authAPI.login(email, password);
      const user = result.data;
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('username', user.username);
      if (user.role === 'driver') navigate('/admin/delivery');
      else navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="login-form-container">
      <h3 className="login-title">Sign in to start using the system</h3>
      <p className="login-desc">Input your e-mail and password</p>
      {error && <div className="alert alert-danger">{error}</div>}
      <form className="login-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Email" 
          className="form-control mb-3" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="form-control mb-3" 
          required 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="btn btn-primary w-100 mb-2">Login</button>
      </form>
      <div className="login-links">
        <span>Forgot password? </span>
        <Link to="/admin/recover-password" className="recover-link">Recover password</Link>
      </div>
    </div>
  );
};

export default LoginForm;
