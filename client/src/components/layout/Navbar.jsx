import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiSearch, FiMenu, FiX, FiHeart, FiChevronDown, FiLogOut, FiSettings, FiPackage } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => { setMenuOpen(false); }, [location]);

  useEffect(() => {
    const handler = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => { logout(); navigate('/'); setDropdownOpen(false); };

  const categories = ['Electronics', 'Clothing', 'Books', 'Home & Kitchen', 'Sports', 'Beauty'];

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🛍️</span>
          <span className="logo-text">Shop<span>Ease</span></span>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products, brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <FiSearch size={18} />
          </button>
        </form>

        {/* Desktop Actions */}
        <div className="navbar-actions hide-mobile">
          <Link to="/wishlist" className="nav-icon-btn" aria-label="Wishlist">
            <FiHeart size={20} />
          </Link>
          <Link to="/cart" className="nav-icon-btn cart-btn" aria-label="Cart">
            <FiShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount > 99 ? '99+' : itemCount}</span>}
          </Link>

          {user ? (
            <div className="user-dropdown" ref={dropdownRef}>
              <button className="user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.avatar
                  ? <img src={`${process.env.REACT_APP_UPLOADS_URL}/avatars/${user.avatar}`} alt={user.name} className="user-avatar" />
                  : <div className="user-avatar-placeholder">{user.name[0].toUpperCase()}</div>
                }
                <span className="user-name">{user.name.split(' ')[0]}</span>
                <FiChevronDown size={14} className={dropdownOpen ? 'rotated' : ''} />
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <p className="dropdown-name">{user.name}</p>
                    <p className="dropdown-email">{user.email}</p>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiUser size={15} /> Profile</Link>
                  <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiPackage size={15} /> Orders</Link>
                  {isAdmin && <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}><FiSettings size={15} /> Admin Panel</Link>}
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout" onClick={handleLogout}><FiLogOut size={15} /> Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
            </div>
          )}
        </div>

        {/* Mobile */}
        <div className="mobile-actions hide-desktop">
          <Link to="/cart" className="nav-icon-btn cart-btn">
            <FiShoppingCart size={20} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>
          <button className="nav-icon-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Categories bar */}
      <div className="categories-bar hide-mobile">
        <div className="container categories-inner">
          <Link to="/products" className="cat-link">All Products</Link>
          {categories.map((c) => (
            <Link key={c} to={`/products?category=${c.toLowerCase().replace(/\s+/g, '-')}`} className="cat-link">{c}</Link>
          ))}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu slide-in">
          <form className="mobile-search" onSubmit={handleSearch}>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="form-input" />
            <button type="submit" className="btn btn-primary btn-sm"><FiSearch size={16} /></button>
          </form>
          <div className="mobile-links">
            <Link to="/products" className="mobile-link">All Products</Link>
            {categories.map((c) => (
              <Link key={c} to={`/products?category=${c.toLowerCase().replace(/\s+/g, '-')}`} className="mobile-link">{c}</Link>
            ))}
            <div className="mobile-divider" />
            {user ? (
              <>
                <Link to="/profile" className="mobile-link"><FiUser size={15} /> Profile</Link>
                <Link to="/orders" className="mobile-link"><FiPackage size={15} /> Orders</Link>
                <Link to="/wishlist" className="mobile-link"><FiHeart size={15} /> Wishlist</Link>
                {isAdmin && <Link to="/admin" className="mobile-link"><FiSettings size={15} /> Admin</Link>}
                <button className="mobile-link logout" onClick={handleLogout}><FiLogOut size={15} /> Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="mobile-link">Login</Link>
                <Link to="/register" className="mobile-link">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
