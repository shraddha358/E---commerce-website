import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiCheck, FiPackage } from 'react-icons/fi';
import { orderAPI } from '../services/api';
import { Loader } from '../components/ui/UI';
import './Orders.css';

export const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader />;

  return (
    <div className="container" style={{ maxWidth: 600, padding: '48px 16px' }}>
      <div className="success-card fade-in">
        <div className="success-icon"><FiCheck size={32} /></div>
        <h1>Order Placed!</h1>
        <p>Thank you for your order. We've sent a confirmation to your email.</p>
        {order && (
          <div className="order-info-box">
            <div className="order-info-row"><span>Order Number</span><strong>{order.order_number}</strong></div>
            <div className="order-info-row"><span>Total</span><strong>₹{parseFloat(order.total).toLocaleString('en-IN')}</strong></div>
            <div className="order-info-row"><span>Payment</span><strong>{order.payment_method.toUpperCase()}</strong></div>
            <div className="order-info-row"><span>Status</span><span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>{order.status}</span></div>
          </div>
        )}
        <div className="success-actions">
          <Link to={`/orders/${id}`} className="btn btn-primary"><FiPackage size={16} /> View Order</Link>
          <Link to="/products" className="btn btn-outline">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchOrders = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await orderAPI.getAll({ page: p, limit: 10 });
      setOrders(data.orders);
      setPages(data.pages);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(page); }, [page]);

  const STATUS_BADGE = { pending: 'badge-warning', confirmed: 'badge-info', processing: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger', refunded: 'badge-gray' };

  if (loading) return <Loader />;

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="empty-state"><div className="empty-state-icon">📦</div><h3>No orders yet</h3><p>Start shopping to place your first order!</p><Link to="/products" className="btn btn-primary">Shop Now</Link></div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const items = order.items ? (typeof order.items === 'string' ? JSON.parse(order.items) : order.items) : [];
              return (
                <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
                  <div className="order-card-header">
                    <div>
                      <p className="order-number">#{order.order_number}</p>
                      <p className="order-date">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    <span className={`badge ${STATUS_BADGE[order.status] || 'badge-gray'}`} style={{ textTransform: 'capitalize' }}>{order.status}</span>
                  </div>
                  <div className="order-card-items">
                    {items.slice(0, 3).map((item, i) => (
                      <span key={i} className="order-item-name">{item.product_name}{i < Math.min(items.length, 3) - 1 ? ', ' : ''}</span>
                    ))}
                    {items.length > 3 && <span className="order-more">+{items.length - 3} more</span>}
                  </div>
                  <div className="order-card-footer">
                    <span className="order-total">₹{parseFloat(order.total).toLocaleString('en-IN')}</span>
                    <span className="order-items-count">{items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const OrderDetail = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getById(id).then(({ data }) => setOrder(data.order)).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await orderAPI.cancel(id);
      setOrder((o) => ({ ...o, status: 'cancelled' }));
    } catch {}
    finally { setCancelling(false); }
  };

  if (loading) return <Loader />;
  if (!order) return <div className="container" style={{ padding: '40px 16px' }}><h2>Order not found</h2></div>;

  const shippingAddr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;

  return (
    <div className="order-detail-page">
      <div className="container">
        <div className="order-detail-header">
          <div>
            <Link to="/orders" className="back-link">← My Orders</Link>
            <h1>Order #{order.order_number}</h1>
            <p>{new Date(order.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          {['pending', 'confirmed'].includes(order.status) && (
            <button className="btn btn-danger" onClick={handleCancel} disabled={cancelling}>{cancelling ? 'Cancelling...' : 'Cancel Order'}</button>
          )}
        </div>

        <div className="order-detail-grid">
          <div>
            <div className="card">
              <div className="card-header">Order Items</div>
              <div className="card-body" style={{ padding: 0 }}>
                {(order.items || []).map((item) => (
                  <div key={item.id} className="order-detail-item">
                    <div className="odi-img">
                      {item.product_image ? <img src={`${process.env.REACT_APP_UPLOADS_URL}/products/${item.product_image}`} alt={item.product_name} /> : '🛍️'}
                    </div>
                    <div className="odi-info">
                      <p>{item.product_name}</p>
                      <span>Qty: {item.quantity} × ₹{parseFloat(item.price).toLocaleString('en-IN')}</span>
                    </div>
                    <span className="odi-total">₹{parseFloat(item.total).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="card-header">Order Summary</div>
              <div className="card-body">
                <div className="summary-row"><span>Subtotal</span><span>₹{parseFloat(order.subtotal).toLocaleString('en-IN')}</span></div>
                <div className="summary-row"><span>Shipping</span><span>{parseFloat(order.shipping_charge) === 0 ? 'FREE' : `₹${order.shipping_charge}`}</span></div>
                <div className="summary-divider" />
                <div className="summary-total"><span>Total</span><span>₹{parseFloat(order.total).toLocaleString('en-IN')}</span></div>
                <div style={{ marginTop: 12 }}>
                  <div className="summary-row"><span>Payment</span><span className="badge badge-gray">{order.payment_method.toUpperCase()}</span></div>
                  <div className="summary-row"><span>Status</span><span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>{order.status}</span></div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">Shipping Address</div>
              <div className="card-body" style={{ fontSize: '0.875rem', color: 'var(--gray-700)', lineHeight: 1.8 }}>
                <p><strong>{shippingAddr?.full_name}</strong></p>
                <p>{shippingAddr?.address_line1}{shippingAddr?.address_line2 ? `, ${shippingAddr.address_line2}` : ''}</p>
                <p>{shippingAddr?.city}, {shippingAddr?.state} {shippingAddr?.postal_code}</p>
                <p>{shippingAddr?.country}</p>
                <p>📞 {shippingAddr?.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
