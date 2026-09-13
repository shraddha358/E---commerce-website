import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/UI';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import './Wishlist.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const Wishlist = () => {
  const { items, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  if (!items.length) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <EmptyState icon="❤️" title="Your wishlist is empty" description="Save items you love to your wishlist" action={<Link to="/products" className="btn btn-primary">Explore Products</Link>} />
    </div>
  );

  return (
    <div className="wishlist-page">
      <div className="container">
        <div className="page-header">
          <h1><FiHeart /> My Wishlist</h1>
          <span className="badge badge-primary">{items.length} item{items.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="wishlist-grid">
          {items.map((item) => {
            const imgs = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
            return (
              <div key={item.id} className="wishlist-card">
                <Link to={`/products/${item.slug}`} className="wishlist-img">
                  {imgs[0] ? <img src={`${UPLOADS}/products/${imgs[0]}`} alt={item.name} /> : <div className="wishlist-no-img">🛍️</div>}
                </Link>
                <div className="wishlist-info">
                  <Link to={`/products/${item.slug}`} className="wishlist-name">{item.name}</Link>
                  <div className="price" style={{ marginTop: 8, marginBottom: 12 }}>
                    <span className="price-current">₹{parseFloat(item.discount_price || item.price).toLocaleString('en-IN')}</span>
                    {item.discount_price && <span className="price-original">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>}
                  </div>
                  <div className="wishlist-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => addToCart(item.product_id)} disabled={item.stock === 0}>
                      <FiShoppingCart size={14} /> {item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => toggleWishlist(item.product_id)} aria-label="Remove">
                      <FiTrash2 size={15} style={{ color: 'var(--danger)' }} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Wishlist;
