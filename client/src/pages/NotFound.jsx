import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
    <div style={{ textAlign: 'center', maxWidth: 480 }}>
      <div style={{ fontSize: '6rem', marginBottom: 16 }}>🔍</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 900, color: 'var(--primary)', marginBottom: 8 }}>404</h1>
      <h2 style={{ marginBottom: 12, color: 'var(--gray-800)' }}>Page Not Found</h2>
      <p style={{ color: 'var(--gray-500)', marginBottom: 28 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/products" className="btn btn-outline btn-lg">Browse Products</Link>
      </div>
    </div>
  </div>
);

export default NotFound;
