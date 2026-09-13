import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail } from 'react-icons/fi';
import { authAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
      toast.success('Reset link sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset email');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopEase</Link>
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a reset link</p>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
            <h3 style={{ marginBottom: 8 }}>Check your email</h3>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <Link to="/login" className="btn btn-primary btn-full" style={{ marginTop: 20 }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email <span>*</span></label>
              <div className="input-icon-wrap">
                <FiMail size={16} className="input-icon" />
                <input type="email" className="form-input with-icon" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
        <p className="auth-switch"><Link to="/login">← Back to Login</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
