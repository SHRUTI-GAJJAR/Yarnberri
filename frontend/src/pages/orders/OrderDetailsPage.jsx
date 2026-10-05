import { useEffect, useState } from 'react';
import { ArrowLeft, MapPin, PackageCheck, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { cancelOrder, getOrderById } from '../../services/orderService';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(value)) : 'Date unavailable';

const formatStatus = (value) =>
  String(value || 'pending')
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const cancellableStatuses = ['pending_payment', 'paid', 'confirmed'];

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { notify } = useNotifications();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');
    getOrderById(orderId)
      .then((response) => {
        if (isMounted) setOrder(response?.order || null);
      })
      .catch((requestError) => {
        if (isMounted) setError(requestError?.response?.data?.message || 'We could not load this order.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const handleCancel = async () => {
    if (!window.confirm('Would you like to cancel this order?')) return;

    setCancelling(true);
    try {
      const response = await cancelOrder(orderId);
      setOrder((current) => ({ ...current, ...(response?.order || {}), orderStatus: response?.order?.orderStatus || 'cancelled' }));
      notify('Your order has been cancelled.', 'success');
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to cancel this order right now.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <section className="yb-section yb-orders-page"><div className="container"><p role="status" className="yb-muted-copy">Loading your order details...</p></div></section>;
  }

  if (error || !order) {
    return (
      <section className="yb-section yb-orders-page">
        <div className="container">
          <div className="yb-page-alert" role="alert">{error || 'This order could not be found.'}</div>
          <Link to="/orders" className="yb-inline-link"><ArrowLeft size={15} /> Back to orders</Link>
        </div>
      </section>
    );
  }

  const address = order.shippingAddress || {};

  return (
    <section className="yb-section yb-orders-page yb-order-detail-page">
      <div className="container">
        <Link to="/orders" className="yb-inline-link yb-order-back"><ArrowLeft size={15} /> All orders</Link>
        <div className="yb-page-heading">
          <span className="yb-eyebrow"><Sparkles size={14} /> Your handmade parcel</span>
          <h1 className="yb-section-title">Order {order.orderNumber || `#${order._id}`}</h1>
          <p>Placed {formatDate(order.createdAt)}</p>
        </div>

        <div className="yb-order-detail-grid">
          <div className="yb-order-detail-main">
            <section className="yb-account-panel">
              <div className="yb-order-status-line">
                <span className={`yb-order-status status-${order.orderStatus || 'pending'}`}>{formatStatus(order.orderStatus)}</span>
                <span>Payment {formatStatus(order.paymentStatus)}</span>
              </div>
              <div className="yb-order-items">
                {(order.items || []).map((item, index) => (
                  <article className="yb-order-item" key={`${item.product || item.name}-${index}`}>
                    <div className="yb-order-item-image">
                      {item.image ? <img src={item.image} alt={item.name || 'Ordered handmade product'} /> : <div className="yb-product-fallback" aria-hidden="true" />}
                    </div>
                    <div>
                      <h2>{item.name}</h2>
                      <p>Quantity: {item.quantity}</p>
                      {item.preparationTime && <p>Preparation: {item.preparationTime}</p>}
                    </div>
                    <strong>{formatPrice((item.price || 0) * (item.quantity || 0))}</strong>
                  </article>
                ))}
              </div>
              <div className="yb-order-total">
                <span>Order total</span>
                <strong>{formatPrice(order.totalAmount)}</strong>
              </div>
            </section>

            {cancellableStatuses.includes(order.orderStatus) && (
              <button type="button" className="yb-btn yb-btn-outline yb-order-cancel" onClick={handleCancel} disabled={cancelling}>
                {cancelling ? 'Cancelling...' : 'Cancel order'}
              </button>
            )}
          </div>

          <aside className="yb-account-panel yb-order-address">
            <div className="yb-account-panel-heading">
              <div><h2>Delivery address</h2><p>Destination for this order.</p></div>
              <MapPin size={19} aria-hidden="true" />
            </div>
            <strong>{address.fullName}</strong>
            <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
            <p>{address.city}, {address.state} {address.pincode}</p>
            <p>{address.country}</p>
            <p>{address.phone}</p>
            {order.shippingDetails?.trackingUrl && (
              <a className="yb-btn yb-btn-outline yb-tracking-link" href={order.shippingDetails.trackingUrl} target="_blank" rel="noopener noreferrer">
                <PackageCheck size={16} /> Track shipment
              </a>
            )}
            {order.shippingDetails?.trackingId && <p className="yb-tracking-id">Tracking ID: {order.shippingDetails.trackingId}</p>}
          </aside>
        </div>
      </div>
    </section>
  );
}
