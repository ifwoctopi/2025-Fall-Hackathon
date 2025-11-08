import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (email && password) {
      login(email, remember);
      navigate('/search');
    } else {
      alert('Please enter both email and password');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="logo">
          <h1>🏥 Medical Simplifier</h1>
          <p>Transform complex medical instructions into simple, easy-to-understand language</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
          </div>
          
          <button type="submit" className="btn btn-primary">
            Login
          </button>
          
          <div className="signup-link">
            <p>Don't have an account? <a href="#signup">Sign up</a></p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

