import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheck } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Checkout.css';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when your order arrives' },
  { id: 'razorpay', label: 'Razorpay', icon: '💳', desc: 'Cards, UPI, Net Banking & more' },
];

const Checkout = () => {
  const { items, subtotal, shippingCharge, total, itemCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [address, setAddress] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'India',
  });
  const [errors, setErrors] = useState({});

  const UPLOADS = process.env.REACT_APP_UPLOADS_URL || 'http://localhost:5000/uploads';

  const validateAddress = () => {
    const e = {};
    if (!address.full_name.trim()) e.full_name = 'Full name required';
    if (!address.phone.trim()) e.phone = 'Phone required';
    if (!address.address_line1.trim()) e.address_line1 = 'Address required';
    if (!address.city.trim()) e.city = 'City required';
    if (!address.state.trim()) e.state = 'State required';
    if (!address.postal_code.trim()) e.postal_code = 'Postal code required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePlaceOrder = async () => {
    if (!validateAddress()) { setStep(1); return; }
    setLoading(true);
    try {
      const { data } = await orderAPI.create({ shippingAddress: address, paymentMethod });
      toast.success('Order placed successfully!');
      navigate(`/order-success/${data.order.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally { setLoading(false); }
  };

  const set = (field) => (e) => setAddress((a) => ({ ...a, [field]: e.target.value }));

  return (
    <div className="checkout-page">
      <div className="container">
        <h1 className="checkout-title">Checkout</h1>

        {/* Steps */}
        <div className="checkout-steps">
          {['Shipping Address', 'Payment', 'Review'].map((s, i) => (
            <div key={i} className={`step ${step > i + 1 ? 'done' : ''} ${step === i + 1 ? 'active' : ''}`}>
              <div className="step-num">{step > i + 1 ? <FiCheck size={14} /> : i + 1}</div>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className="checkout-layout">
          <div className="checkout-form-section">
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="checkout-step-card fade-in">
                <h2>Shipping Address</h2>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Full Name <span>*</span></label>
                    <input className={`form-input ${errors.full_name ? 'error' : ''}`} value={address.full_name} onChange={set('full_name')} placeholder="John Doe" />
                    {errors.full_name && <span className="form-error">{errors.full_name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone <span>*</span></label>
                    <input className={`form-input ${errors.phone ? 'error' : ''}`} value={address.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 1 <span>*</span></label>
                  <input className={`form-input ${errors.address_line1 ? 'error' : ''}`} value={address.address_line1} onChange={set('address_line1')} placeholder="House/Flat No., Street" />
                  {errors.address_line1 && <span className="form-error">{errors.address_line1}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Address Line 2</label>
                  <input className="form-input" value={address.address_line2} onChange={set('address_line2')} placeholder="Landmark, Area (optional)" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">City <span>*</span></label>
                    <input className={`form-input ${errors.city ? 'error' : ''}`} value={address.city} onChange={set('city')} placeholder="Mumbai" />
                    {errors.city && <span className="form-error">{errors.city}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">State <span>*</span></label>
                    <input className={`form-input ${errors.state ? 'error' : ''}`} value={address.state} onChange={set('state')} placeholder="Maharashtra" />
                    {errors.state && <span className="form-error">{errors.state}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Postal Code <span>*</span></label>
                    <input className={`form-input ${errors.postal_code ? 'error' : ''}`} value={address.postal_code} onChange={set('postal_code')} placeholder="400001" />
                    {errors.postal_code && <span className="form-error">{errors.postal_code}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Country</label>
                    <input className="form-input" value={address.country} onChange={set('country')} />
                  </div>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => { if (validateAddress()) setStep(2); }}>Continue to Payment</button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="checkout-step-card fade-in">
                <h2>Payment Method</h2>
                <div className="payment-methods">
                  {PAYMENT_METHODS.map((pm) => (
                    <label key={pm.id} className={`payment-option ${paymentMethod === pm.id ? 'selected' : ''}`}>
                      <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                      <span className="payment-icon">{pm.icon}</span>
                      <div>
                        <p className="payment-label">{pm.label}</p>
                        <p className="payment-desc">{pm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Continue to Review</button>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="checkout-step-card fade-in">
                <h2>Review Your Order</h2>
                <div className="review-address">
                  <h4>Shipping to:</h4>
                  <p>{address.full_name}</p>
                  <p>{address.address_line1}{address.address_line2 ? `, ${address.address_line2}` : ''}</p>
                  <p>{address.city}, {address.state} {address.postal_code}</p>
                  <p>{address.country}</p>
                  <p>📞 {address.phone}</p>
                </div>
                <div className="review-items">
                  {items.map((item) => {
                    const imgs = item.images ? (typeof item.images === 'string' ? JSON.parse(item.images) : item.images) : [];
                    return (
                      <div key={item.id} className="review-item">
                        <div className="review-item-img">
                          {imgs[0] ? <img src={`${UPLOADS}/products/${imgs[0]}`} alt={item.name} /> : '🛍️'}
                        </div>
                        <div className="review-item-info">
                          <p>{item.name}</p>
                          <span>Qty: {item.quantity}</span>
                        </div>
                        <span className="review-item-price">₹{(parseFloat(item.discount_price || item.price) * item.quantity).toLocaleString('en-IN')}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="step-actions">
                  <button className="btn btn-ghost" onClick={() => setStep(2)}>← Back</button>
                  <button className="btn btn-primary btn-lg" onClick={handlePlaceOrder} disabled={loading}>
                    {loading ? 'Placing Order...' : `Place Order • ₹${total.toLocaleString('en-IN')}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="checkout-summary">
            <div className="summary-card">
              <h3>Order Summary</h3>
              <div className="summary-row"><span>Items ({itemCount})</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
              <div className="summary-row"><span>Shipping</span><span>{shippingCharge === 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : `₹${shippingCharge}`}</span></div>
              <div className="summary-divider" />
              <div className="summary-total"><span>Total</span><span>₹{total.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
