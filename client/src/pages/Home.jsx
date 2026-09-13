import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiShield, FiTruck, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { productAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/product/ProductCard';
import { Loader } from '../components/ui/UI';
import './Home.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featRes, catRes, newRes] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 8 }),
          categoryAPI.getAll({ active: true }),
          productAPI.getAll({ sort: 'newest', limit: 8 }),
        ]);
        setFeatured(featRes.data.products);
        setCategories(catRes.data.categories);
        setNewArrivals(newRes.data.products);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const FEATURES = [
    { icon: <FiTruck size={28} />, title: 'Free Delivery', desc: 'On orders above ₹500' },
    { icon: <FiRefreshCw size={28} />, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: <FiShield size={28} />, title: 'Secure Payment', desc: '100% secure transactions' },
    { icon: <FiHeadphones size={28} />, title: '24/7 Support', desc: 'Dedicated customer support' },
  ];

  const CAT_ICONS = { electronics: '💻', clothing: '👗', books: '📚', 'home-kitchen': '🏠', sports: '⚽', beauty: '💄' };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <span className="hero-badge">🎉 New Arrivals Every Week</span>
            <h1>Discover Amazing<br />Products at <span className="hero-highlight">Best Prices</span></h1>
            <p>Shop from thousands of products across all categories. Fast delivery, easy returns, and 24/7 support.</p>
            <form className="hero-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for products, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="hero-search-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div className="hero-actions">
              <Link to="/products" className="btn btn-primary btn-lg">Shop Now <FiArrowRight size={18} /></Link>
              <Link to="/products?featured=true" className="btn btn-outline btn-lg">Featured Deals</Link>
            </div>
          </div>
          <div className="hero-image fade-in">
            <div className="hero-card">
              <div className="hero-emoji">🛍️</div>
              <div className="hero-stats">
                <div className="stat"><span className="stat-num">50K+</span><span>Products</span></div>
                <div className="stat"><span className="stat-num">1M+</span><span>Customers</span></div>
                <div className="stat"><span className="stat-num">4.8★</span><span>Rating</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-bar">
        <div className="container features-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-item">
              <div className="feature-icon">{f.icon}</div>
              <div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Shop by Category</h2>
              <p className="section-subtitle">Find exactly what you're looking for</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm">View All <FiArrowRight size={14} /></Link>
          </div>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.slug}`} className="category-card">
                <div className="cat-icon">{CAT_ICONS[cat.slug] || '🛒'}</div>
                <h3>{cat.name}</h3>
                <p>{cat.product_count} items</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="section" style={{ background: 'var(--white)', padding: '64px 0' }}>
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p className="section-subtitle">Hand-picked products just for you</p>
            </div>
            <Link to="/products?featured=true" className="btn btn-outline btn-sm">See All <FiArrowRight size={14} /></Link>
          </div>
          {loading ? <Loader /> : (
            <div className="grid-products">
              {featured.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="promo-banner">
        <div className="container promo-content">
          <div>
            <h2>Up to 50% Off on Electronics 🎧</h2>
            <p>Limited time offer on top brands. Don't miss out!</p>
          </div>
          <Link to="/products?category=electronics" className="btn btn-primary btn-lg">Shop Electronics</Link>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-title">New Arrivals</h2>
              <p className="section-subtitle">Fresh picks added this week</p>
            </div>
            <Link to="/products?sort=newest" className="btn btn-outline btn-sm">View All <FiArrowRight size={14} /></Link>
          </div>
          {loading ? <Loader /> : (
            <div className="grid-products">
              {newArrivals.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
