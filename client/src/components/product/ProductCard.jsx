import React from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();

  const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
  const imgSrc = images[0] ? `${UPLOADS}/products/${images[0]}` : null;
  const wishlisted = isWishlisted(product.id);
  const discount = product.discount_price
    ? Math.round(((product.price - product.discount_price) / product.price) * 100)
    : 0;
  const effectivePrice = parseFloat(product.discount_price || product.price);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await addToCart(product.id);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    await toggleWishlist(product.id);
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-img-wrap">
        {imgSrc
          ? <img src={imgSrc} alt={product.name} loading="lazy" />
          : <div className="product-img-placeholder">🛍️</div>
        }
        {discount > 0 && <span className="discount-badge">{discount}% OFF</span>}
        {product.stock === 0 && <span className="out-of-stock-badge">Out of Stock</span>}
        <button className={`wishlist-btn ${wishlisted ? 'active' : ''}`} onClick={handleWishlist} aria-label="Wishlist">
          <FiHeart size={16} />
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">{product.category_name}</p>
        <h3 className="product-name">{product.name}</h3>

        {product.rating_count > 0 && (
          <div className="product-rating">
            <FiStar size={12} className="star-icon" />
            <span>{parseFloat(product.rating_avg).toFixed(1)}</span>
            <span className="rating-count">({product.rating_count})</span>
          </div>
        )}

        <div className="product-price-row">
          <div className="price">
            <span className="price-current">₹{effectivePrice.toLocaleString('en-IN')}</span>
            {product.discount_price && (
              <span className="price-original">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            className="add-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
          >
            <FiShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
