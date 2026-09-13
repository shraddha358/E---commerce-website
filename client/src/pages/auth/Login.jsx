import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password) e.password = 'Password is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await login(form.email, form.password);
    if (res.success) navigate(from, { replace: true });
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopEase</Link>
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <div className="input-icon-wrap">
              <FiMail size={16} className="input-icon" />
              <input type="email" className={`form-input with-icon ${errors.email ? 'error' : ''}`} placeholder="your@email.com" value={form.email} onChange={set('email')} />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Password <span>*</span></label>
            <div className="input-icon-wrap">
              <FiLock size={16} className="input-icon" />
              <input type={showPwd ? 'text' : 'password'} className={`form-input with-icon with-icon-right ${errors.password ? 'error' : ''}`} placeholder="••••••••" value={form.password} onChange={set('password')} />
              <button type="button" className="toggle-pwd" onClick={() => setShowPwd((s) => !s)}>
                {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>
          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-divider"><span>Demo Credentials</span></div>
        <div className="demo-creds">
          <div><strong>User:</strong> john@example.com / Admin@123</div>
          <div><strong>Admin:</strong> admin@shopease.com / Admin@123</div>
        </div>
        <p className="auth-switch">Don't have an account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
};

export default Login;
