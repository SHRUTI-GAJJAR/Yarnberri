import { useEffect, useState } from 'react';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { getAddresses, addAddress } from '../../services/addressService';
import { createOrder, markPaymentFailed, verifyPayment } from '../../services/orderService';

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
let razorpayScriptPromise;

const loadRazorpayScript = () => {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
};

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const emptyAddressForm = {
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
  country: 'India',
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, cartTotal, fetchCart } = useCart();
  const { notify } = useNotifications();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await getAddresses();
        const nextAddresses = response.addresses || [];
        setAddresses(nextAddresses);

        const defaultAddress = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress._id);
        }
      } catch (error) {
        setAddresses([]);
        setAddressError(error?.response?.data?.message || 'We could not load your saved addresses.');
      } finally {
        setIsLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const shipping = items.length > 0 ? 120 : 0;
  const total = cartTotal + shipping;

  const handleAddressChange = (field, value) => {
    setAddressForm((current) => ({ ...current, [field]: value }));
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();

    try {
      const response = await addAddress(addressForm);
      const nextAddresses = response.addresses || [];
      setAddresses(nextAddresses);
      const createdDefault = nextAddresses.find((address) => address.isDefault) || nextAddresses[0];
      if (createdDefault) {
        setSelectedAddressId(createdDefault._id);
      }
      setAddressForm(emptyAddressForm);
      setShowAddressForm(false);
      notify('Shipping address saved.', 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to save the address.', 'error');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      notify('Please select a delivery address before placing the order.', 'error');
      return;
    }

    if (items.length === 0) {
      navigate('/shop');
      return;
    }

    setSubmitting(true);

    try {
      const response = await createOrder({
        addressId: selectedAddressId,
        checkoutType: 'cart',
      });

      const order = response?.order;
      const payment = response?.payment;
      if (!order?._id || !payment?.keyId || !payment?.orderId) {
        throw new Error('The payment could not be initialized. Please try again.');
      }

      const isRazorpayLoaded = await loadRazorpayScript();
      if (!isRazorpayLoaded) {
        await markPaymentFailed(order._id);
        throw new Error('Secure payment could not be loaded. Please try checkout again.');
      }

      let paymentSettled = false;
      const razorpay = new window.Razorpay({
        key: payment.keyId,
        amount: payment.amount,
        currency: payment.currency,
        name: 'Yarnberri',
        description: `Handmade order ${order.orderNumber || ''}`.trim(),
        order_id: payment.orderId,
        handler: async (paymentResult) => {
          paymentSettled = true;
          try {
            await verifyPayment(order._id, {
              razorpayOrderId: paymentResult.razorpay_order_id,
              razorpayPaymentId: paymentResult.razorpay_payment_id,
              razorpaySignature: paymentResult.razorpay_signature,
            });
            await fetchCart();
            notify('Payment received. Your handmade order is confirmed.', 'success');
            navigate(`/orders/${order._id}`);
          } catch (verificationError) {
            notify(verificationError?.response?.data?.message || 'Payment verification failed. Please contact us before trying again.', 'error');
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (!paymentSettled) {
              try {
                await markPaymentFailed(order._id);
                notify('Payment was cancelled. You can try again from checkout.', 'error');
              } catch (paymentError) {
                notify(paymentError?.response?.data?.message || 'Payment was closed, but its status could not be updated.', 'error');
              }
            }
            setSubmitting(false);
          },
        },
        theme: { color: '#5a3d35' },
      });
      razorpay.open();
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to create the order right now.', 'error');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <section className="yb-section">
        <div className="container">
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Sparkles size={28} />
              <p>Your cart is empty. Add a few handmade pieces before checkout.</p>
              <Link to="/shop" className="yb-btn yb-btn-primary">
                Browse products
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="yb-section yb-checkout-page">
      <div className="container">
        <div className="yb-section-heading">
          <div>
            <div className="yb-eyebrow">
              <ShieldCheck size={14} />
              Secure checkout
            </div>
            <h1 className="yb-section-title">Checkout</h1>
          </div>
        </div>

        <div className="row g-4 align-items-start">
          <div className="col-lg-7">
            <div className="yb-checkout-panel">
              <div className="yb-checkout-panel-header">
                <h3>Delivery address</h3>
                <button type="button" className="yb-link-btn" onClick={() => setShowAddressForm((current) => !current)}>
                  {showAddressForm ? 'Hide form' : 'Add new address'}
                </button>
              </div>

              {isLoading ? (
                <p className="yb-muted-copy">Loading your saved addresses...</p>
              ) : addressError ? (
                <p className="yb-page-alert" role="alert">{addressError}</p>
              ) : addresses.length === 0 ? (
                <div className="yb-empty-mini">
                  <p>No saved addresses yet.</p>
                </div>
              ) : (
                <div className="yb-address-list">
                  {addresses.map((address) => (
                    <label key={address._id} className={`yb-address-card ${selectedAddressId === address._id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="selectedAddress"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                      />
                      <div>
                        <div className="yb-address-topline">
                          <strong>{address.fullName}</strong>
                          {address.isDefault && <span>Default</span>}
                        </div>
                        <p>{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                        <p>{address.city}, {address.state} {address.pincode}</p>
                        <p>{address.phone}</p>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {showAddressForm && (
                <form className="yb-address-form" onSubmit={handleAddAddress}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label>Full name</label>
                      <input value={addressForm.fullName} onChange={(event) => handleAddressChange('fullName', event.target.value)} required />
                    </div>
                    <div className="col-md-6">
                      <label>Phone</label>
                      <input value={addressForm.phone} onChange={(event) => handleAddressChange('phone', event.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label>Address line 1</label>
                      <input value={addressForm.addressLine1} onChange={(event) => handleAddressChange('addressLine1', event.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label>Address line 2</label>
                      <input value={addressForm.addressLine2} onChange={(event) => handleAddressChange('addressLine2', event.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label>City</label>
                      <input value={addressForm.city} onChange={(event) => handleAddressChange('city', event.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <label>State</label>
                      <input value={addressForm.state} onChange={(event) => handleAddressChange('state', event.target.value)} required />
                    </div>
                    <div className="col-md-4">
                      <label>Pincode</label>
                      <input value={addressForm.pincode} onChange={(event) => handleAddressChange('pincode', event.target.value)} required />
                    </div>
                    <div className="col-12">
                      <label>Country</label>
                      <input value={addressForm.country} onChange={(event) => handleAddressChange('country', event.target.value)} />
                    </div>
                  </div>

                  <div className="yb-address-form-actions">
                    <button type="submit" className="yb-btn yb-btn-primary">
                      Save address
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <div className="col-lg-5">
            <aside className="yb-cart-summary">
              <h3>Order summary</h3>

              <div className="yb-checkout-items">
                {items.map((item) => (
                  <div key={item.product?._id || item.product} className="yb-checkout-item">
                    <div className="yb-checkout-image">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} />
                      ) : (
                        <div className="yb-product-fallback" aria-hidden="true" />
                      )}
                    </div>

                    <div className="yb-checkout-item-copy">
                      <strong>{item.product?.name || 'Product'}</strong>
                      <span>Qty: {item.quantity}</span>
                    </div>

                    <strong>{formatPrice((item.product?.price || 0) * item.quantity)}</strong>
                  </div>
                ))}
              </div>

              <div className="yb-summary-row">
                <span>Subtotal</span>
                <strong>{formatPrice(cartTotal)}</strong>
              </div>

              <div className="yb-summary-row">
                <span>Shipping</span>
                <strong>{formatPrice(shipping)}</strong>
              </div>

              <div className="yb-summary-row yb-summary-row-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              <button type="button" className="yb-btn yb-btn-primary yb-summary-button" onClick={handlePlaceOrder} disabled={submitting}>
                {submitting ? 'Opening secure payment...' : 'Pay securely'}
                <ArrowRight size={17} />
              </button>

              <div className="yb-trust-note">
                <MapPin size={16} />
                <span>Handmade shipping with gift-ready packaging.</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
