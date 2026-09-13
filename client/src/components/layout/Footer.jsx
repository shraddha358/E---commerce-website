import React from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiYoutube } from 'react-icons/fi';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="container footer-grid">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">🛍️ Shop<span>Ease</span></Link>
        <p>Your one-stop online shopping destination for the best products at unbeatable prices.</p>
        <div className="social-links">
          <a href="#" aria-label="Facebook"><FiFacebook /></a>
          <a href="#" aria-label="Twitter"><FiTwitter /></a>
          <a href="#" aria-label="Instagram"><FiInstagram /></a>
          <a href="#" aria-label="YouTube"><FiYoutube /></a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Quick Links</h4>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/products">All Products</Link></li>
          <li><Link to="/products?featured=true">Featured</Link></li>
          <li><Link to="/cart">Cart</Link></li>
          <li><Link to="/orders">My Orders</Link></li>
        </ul>
      </div>

      <div className="footer-col">
        <h4>Categories</h4>
        <ul>
          {['Electronics','Clothing','Books','Home & Kitchen','Sports','Beauty'].map((c) => (
            <li key={c}><Link to={`/products?category=${c.toLowerCase().replace(/\s+/g,'-')}`}>{c}</Link></li>
          ))}
        </ul>
      </div>

      <div className="footer-col">
        <h4>Contact Us</h4>
        <ul className="contact-list">
          <li><FiMapPin size={14} /> 123 Market Street, Mumbai, India 400001</li>
          <li><FiPhone size={14} /> +91 98765 43210</li>
          <li><FiMail size={14} /> support@shopease.com</li>
        </ul>
        <div className="payment-icons">
          <span>💳</span><span>🏦</span><span>📱</span><span>🔒</span>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <p>© {new Date().getFullYear()} ShopEase. All rights reserved.</p>
      <div className="footer-links">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Refund Policy</a>
      </div>
    </div>
  </footer>
);

export default Footer;
