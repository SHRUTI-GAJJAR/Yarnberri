import { useEffect, useState } from 'react';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyOrders } from '../../services/orderService';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)) : 'Date unavailable';

const formatStatus = (value) =>
  String(value || 'pending')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getMyOrders()
      .then((response) => {
        if (isMounted) setOrders(Array.isArray(response?.orders) ? response.orders : []);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError?.response?.data?.message || 'We could not load your orders. Please try again.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="yb-section yb-orders-page">
      <div className="container">
        <div className="yb-page-heading">
          <span className="yb-eyebrow"><Package size={14} /> Made, packed, and on its way</span>
          <h1 className="yb-section-title">Your orders</h1>
          <p>Follow every little handmade parcel from checkout to delivery.</p>
        </div>

        {loading ? (
          <p className="yb-muted-copy" role="status">Gathering your order history...</p>
        ) : error ? (
          <div className="yb-page-alert" role="alert">{error}</div>
        ) : orders.length === 0 ? (
          <div className="yb-page-empty">
            <Sparkles size={28} aria-hidden="true" />
            <h2>Your next handmade favourite is waiting.</h2>
            <p>When you place an order, its details and delivery updates will appear here.</p>
            <Link to="/shop" className="yb-btn yb-btn-primary">Explore the shop <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="yb-orders-list">
            {orders.map((order) => (
              <article className="yb-order-card" key={order._id}>
                <div className="yb-order-card-top">
                  <div>
                    <span className="yb-order-label">Order</span>
                    <h2>{order.orderNumber || order._id}</h2>
                    <p>Placed {formatDate(order.createdAt)}</p>
                  </div>
                  <span className={`yb-order-status status-${order.orderStatus || 'pending'}`}>{formatStatus(order.orderStatus)}</span>
                </div>
                <div className="yb-order-card-bottom">
                  <span>{order.items?.length || 0} handmade {order.items?.length === 1 ? 'piece' : 'pieces'}</span>
                  <span className="yb-order-payment">Payment: {formatStatus(order.paymentStatus)}</span>
                  <strong>{formatPrice(order.totalAmount)}</strong>
                  <Link to={`/orders/${order._id}`} className="yb-inline-link">View details <ArrowRight size={15} /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
