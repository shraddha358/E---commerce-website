import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/ui/UI';
import './Cart.css';

const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

const Cart = () => {
  const { items, subtotal, shippingCharge, total, itemCount, updateQuantity, removeItem, clearCart, loading } = useCart();
  const navigate = useNavigate();

  if (loading) return <div className="loader-wrapper"><div className="spinner" /></div>;

  if (!items.length) return (
    <div className="container" style={{ paddingTop: 40 }}>
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        description="Add some products to get started"
        action={<Link to="/products" className="btn btn-primary btn-lg">Continue Shopping</Link>}
      />
    </div>
  );

  return (
    <div className="cart-page">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span className="cart-count">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
        </div>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--danger)', marginLeft: 'auto' }}>
                <FiTrash2 size={14} /> Clear All
              </button>
            </div>
            {items.map((item) => {
              const imgs = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
              const price = parseFloat(item.discount_price || item.price);
              return (
                <div key={item.id} className="cart-item">
                  <Link to={`/products/${item.slug}`} className="cart-item-img">
                    {imgs[0] ? <img src={`${UPLOADS}/products/${imgs[0]}`} alt={item.name} /> : <div className="no-img">🛍️</div>}
                  </Link>
                  <div className="cart-item-info">
                    <Link to={`/products/${item.slug}`} className="cart-item-name">{item.name}</Link>
                    <p className="cart-item-category">{item.category_name}</p>
                    <div className="cart-item-price">
                      <span className="price-current">₹{price.toLocaleString('en-IN')}</span>
                      {item.discount_price && <span className="price-original">₹{parseFloat(item.price).toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}><FiMinus size={12} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock}><FiPlus size={12} /></button>
                    </div>
                    <p className="cart-item-total">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
                    <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Remove"><FiTrash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Subtotal ({itemCount} items)</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shippingCharge === 0 ? <span style={{ color: 'var(--success)', fontWeight: 600 }}>FREE</span> : `₹${shippingCharge}`}</span></div>
              {shippingCharge > 0 && <p className="free-shipping-hint">Add ₹{(500 - subtotal).toFixed(0)} more for free shipping!</p>}
              <div className="summary-divider" />
              <div className="summary-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
              <button className="btn btn-primary btn-full btn-lg" onClick={() => navigate('/checkout')}>
                Proceed to Checkout <FiArrowRight size={16} />
              </button>
              <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: 8, justifyContent: 'center' }}>
                <FiShoppingBag size={15} /> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
