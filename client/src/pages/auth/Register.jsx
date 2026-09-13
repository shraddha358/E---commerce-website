import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

const Register = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email';
    if (!form.password || form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const res = await register({ name: form.name, email: form.email, password: form.password, phone: form.phone });
    if (res.success) navigate('/');
  };

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopEase</Link>
          <h2>Create account</h2>
          <p>Join thousands of happy shoppers</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name <span>*</span></label>
            <div className="input-icon-wrap">
              <FiUser size={16} className="input-icon" />
              <input type="text" className={`form-input with-icon ${errors.name ? 'error' : ''}`} placeholder="John Doe" value={form.name} onChange={set('name')} />
            </div>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Email <span>*</span></label>
            <div className="input-icon-wrap">
              <FiMail size={16} className="input-icon" />
              <input type="email" className={`form-input with-icon ${errors.email ? 'error' : ''}`} placeholder="your@email.com" value={form.email} onChange={set('email')} />
            </div>
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <div className="input-icon-wrap">
              <FiPhone size={16} className="input-icon" />
              <input type="tel" className="form-input with-icon" placeholder="+91 98765 43210" value={form.phone} onChange={set('phone')} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password <span>*</span></label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input type={showPwd ? 'text' : 'password'} className={`form-input with-icon with-icon-right ${errors.password ? 'error' : ''}`} placeholder="Min 6 chars" value={form.password} onChange={set('password')} />
                <button type="button" className="toggle-pwd" onClick={() => setShowPwd((s) => !s)}>
                  {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password <span>*</span></label>
              <div className="input-icon-wrap">
                <FiLock size={16} className="input-icon" />
                <input type={showPwd ? 'text' : 'password'} className={`form-input with-icon ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} />
              </div>
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
};

export default Register;
