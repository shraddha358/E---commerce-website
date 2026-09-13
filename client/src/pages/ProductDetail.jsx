import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiShare2, FiTruck, FiRefreshCw, FiShield, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/product/ProductCard';
import Stars from '../components/ui/Stars';
import { Loader, EmptyState } from '../components/ui/UI';
import toast from 'react-hot-toast';
import './ProductDetail.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [tab, setTab] = useState('description');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await productAPI.getBySlug(slug);
        setProduct(data.product);
        setRelated(data.related);
        const revRes = await productAPI.getReviews(data.product.id);
        setReviews(revRes.data.reviews);
      } catch { navigate('/404'); }
      finally { setLoading(false); }
    };
    fetch();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loader />;
  if (!product) return null;

  const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
  const effectivePrice = parseFloat(product.discount_price || product.price);
  const discount = product.discount_price ? Math.round(((product.price - product.discount_price) / product.price) * 100) : 0;
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = async () => {
    if (!user) return navigate('/login');
    await addToCart(product.id, qty);
  };

  const handleBuyNow = async () => {
    if (!user) return navigate('/login');
    const res = await addToCart(product.id, qty);
    if (res?.success !== false) navigate('/cart');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmittingReview(true);
    try {
      await productAPI.addReview(product.id, reviewForm);
      toast.success('Review submitted!');
      const revRes = await productAPI.getReviews(product.id);
      setReviews(revRes.data.reviews);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally { setSubmittingReview(false); }
  };

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="breadcrumb">
          <Link to="/">Home</Link> <FiChevronRight size={12} />
          <Link to="/products">Products</Link> <FiChevronRight size={12} />
          <Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link> <FiChevronRight size={12} />
          <span>{product.name}</span>
        </nav>

        <div className="product-detail-grid">
          {/* Images */}
          <div className="product-images">
            <div className="main-image">
              {images[activeImage]
                ? <img src={`${UPLOADS}/products/${images[activeImage]}`} alt={product.name} />
                : <div className="no-image">🛍️</div>
              }
            </div>
            {images.length > 1 && (
              <div className="image-thumbs">
                {images.map((img, i) => (
                  <button key={i} className={`thumb ${activeImage === i ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                    <img src={`${UPLOADS}/products/${img}`} alt={`${product.name} ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="product-info-panel">
            <div className="product-badges">
              {product.brand && <span className="badge badge-gray">{product.brand}</span>}
              {product.is_featured ? <span className="badge badge-warning">Featured</span> : null}
              {product.stock === 0 && <span className="badge badge-danger">Out of Stock</span>}
              {product.stock > 0 && product.stock <= 10 && <span className="badge badge-warning">Only {product.stock} left!</span>}
            </div>

            <h1 className="product-detail-name">{product.name}</h1>

            {product.rating_count > 0 && (
              <div className="product-detail-rating">
                <Stars rating={product.rating_avg} />
                <span className="rating-value">{parseFloat(product.rating_avg).toFixed(1)}</span>
                <span className="rating-total">({product.rating_count} reviews)</span>
              </div>
            )}

            <div className="product-detail-price">
              <span className="price-current-lg">₹{effectivePrice.toLocaleString('en-IN')}</span>
              {product.discount_price && (
                <>
                  <span className="price-original-lg">₹{parseFloat(product.price).toLocaleString('en-IN')}</span>
                  <span className="price-save">{discount}% OFF</span>
                </>
              )}
            </div>
            {product.discount_price && (
              <p className="savings-text">You save ₹{(product.price - effectivePrice).toLocaleString('en-IN')}</p>
            )}

            <div className="product-meta">
              {product.sku && <div className="meta-row"><span>SKU:</span><span>{product.sku}</span></div>}
              <div className="meta-row"><span>Category:</span><Link to={`/products?category=${product.category_slug}`}>{product.category_name}</Link></div>
              <div className="meta-row"><span>Availability:</span><span className={product.stock > 0 ? 'in-stock' : 'out-of-stock'}>{product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}</span></div>
            </div>

            {/* Quantity */}
            {product.stock > 0 && (
              <div className="quantity-selector">
                <span>Quantity:</span>
                <div className="qty-controls">
                  <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><FiMinus size={14} /></button>
                  <span>{qty}</span>
                  <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={qty >= product.stock}><FiPlus size={14} /></button>
                </div>
              </div>
            )}

            <div className="product-actions">
              <button className="btn btn-primary btn-lg" onClick={handleAddToCart} disabled={product.stock === 0}>
                <FiShoppingCart size={18} /> Add to Cart
              </button>
              <button className="btn btn-secondary btn-lg" onClick={handleBuyNow} disabled={product.stock === 0}>
                Buy Now
              </button>
              <button className={`btn btn-icon btn-lg ${wishlisted ? 'btn-danger' : 'btn-outline'}`} onClick={() => { if (!user) return navigate('/login'); toggleWishlist(product.id); }} aria-label="Wishlist">
                <FiHeart size={20} />
              </button>
            </div>

            <div className="product-guarantees">
              <div className="guarantee-item"><FiTruck size={16} /> Free delivery on orders over ₹500</div>
              <div className="guarantee-item"><FiRefreshCw size={16} /> 30-day easy returns</div>
              <div className="guarantee-item"><FiShield size={16} /> Secure checkout</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="product-tabs">
          <div className="tab-nav">
            {['description', 'reviews'].map((t) => (
              <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'description' ? 'Description' : `Reviews (${reviews.length})`}
              </button>
            ))}
          </div>

          {tab === 'description' && (
            <div className="tab-content fade-in">
              <p style={{ lineHeight: 1.8, color: 'var(--gray-700)' }}>{product.description || 'No description available.'}</p>
            </div>
          )}

          {tab === 'reviews' && (
            <div className="tab-content fade-in">
              {reviews.length === 0 ? (
                <p style={{ color: 'var(--gray-500)' }}>No reviews yet. Be the first to review!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="review-card">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <div className="reviewer-avatar">{r.user_name[0]}</div>
                          <div>
                            <p className="reviewer-name">{r.user_name}</p>
                            <Stars rating={r.rating} size={12} />
                          </div>
                        </div>
                        <span className="review-date">{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                      </div>
                      {r.title && <h4 className="review-title">{r.title}</h4>}
                      {r.comment && <p className="review-comment">{r.comment}</p>}
                    </div>
                  ))}
                </div>
              )}

              {user && (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h3>Write a Review</h3>
                  <div className="form-group">
                    <label className="form-label">Rating <span>*</span></label>
                    <select className="form-input form-select" value={reviewForm.rating} onChange={(e) => setReviewForm((f) => ({ ...f, rating: e.target.value }))}>
                      {[5,4,3,2,1].map((r) => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Title</label>
                    <input className="form-input" placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Comment</label>
                    <textarea className="form-input form-textarea" placeholder="Share your experience..." value={reviewForm.comment} onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))} />
                  </div>
                  <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="related-section">
            <h2 className="section-title">Related Products</h2>
            <div className="grid-products" style={{ marginTop: 24 }}>
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
