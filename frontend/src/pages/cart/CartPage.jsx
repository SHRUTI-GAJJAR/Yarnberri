import { ArrowRight, Minus, Plus, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCategory = (value) =>
  String(value || 'Handmade')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function CartPage() {
  const { items, totalItems, cartTotal, updateQuantity, removeFromCart, loading } = useCart();
  const { notify } = useNotifications();
  const shipping = items.length > 0 ? 120 : 0;
  const total = cartTotal + shipping;

  const handleQuantityChange = async (productId, nextQuantity) => {
    if (!productId || nextQuantity < 1) {
      return;
    }

    try {
      await updateQuantity(productId, nextQuantity);
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to update this item right now.', 'error');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeFromCart(productId);
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to remove this item right now.', 'error');
    }
  };

  if (loading && items.length === 0) {
    return (
      <section className="yb-section yb-cart-page">
        <div className="container">
          <div className="yb-cart-feedback yb-cart-loading" role="status" aria-live="polite">
            <div className="yb-cart-yarn-mark" aria-hidden="true">
              <ShoppingBag size={28} />
            </div>
            <p>Gathering your handmade picks...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="yb-cart-page yb-section">
      <div className="container">
        <div className="yb-section-heading">
          <div>
            <div className="yb-eyebrow yb-cart-eyebrow">
              <Sparkles size={14} />
              Your handmade picks
            </div>
            <h1 className="yb-section-title">Your Crochet Cart</h1>
            <p className="yb-cart-intro">A few handmade favourites waiting for you.</p>
          </div>

          <span key={totalItems} className="yb-cart-count">{totalItems} item{totalItems === 1 ? '' : 's'}</span>
        </div>

        {items.length === 0 ? (
          <div className="yb-cart-empty">
            <div className="yb-cart-yarn-mark" aria-hidden="true">
              <svg viewBox="0 0 100 100" role="presentation">
                <circle cx="50" cy="50" r="35" />
                <path d="M25 39c14 7 36 7 50 0M19 50c18 9 44 9 62 0M25 62c14-7 36-7 50 0M39 20c7 16 7 44 0 60M61 20c-7 16-7 44 0 60" />
              </svg>
            </div>
            <span className="yb-eyebrow yb-cart-eyebrow">Made slowly, chosen with love</span>
            <h2>Your cart is waiting for something handmade.</h2>
            <p>Find a little crochet joy to bring home or share with someone dear.</p>
            <Link to="/shop" className="yb-btn yb-btn-primary">
              Continue shopping
              <ArrowRight size={17} />
            </Link>
          </div>
        ) : (
          <div className="row g-4 align-items-start">
            <div className="col-lg-8">
              <div className="yb-cart-list">
                {items.map((item) => (
                  <article key={item.product?._id || item.product} className="yb-cart-item">
                    <div className="yb-cart-thumb">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} />
                      ) : (
                        <div className="yb-product-fallback" aria-hidden="true" />
                      )}
                    </div>

                    <div className="yb-cart-item-info">
                      <div className="yb-cart-item-header">
                        <div>
                          <p className="yb-cart-category">{formatCategory(item.product?.category)}</p>
                          <h3>{item.product?.name || 'Handmade piece'}</h3>
                          <span className="yb-cart-unit-price">{formatPrice(item.product?.price)} each</span>
                        </div>
                        <button
                          type="button"
                          className="yb-cart-remove"
                          onClick={() => handleRemove(item.product?._id || item.product)}
                          aria-label={`Remove ${item.product?.name || 'product'} from cart`}
                          title="Remove item"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="yb-cart-item-actions">
                        <div className="yb-qty-picker">
                          <button
                            type="button"
                            className="yb-qty-button"
                            onClick={() => handleQuantityChange(item.product?._id || item.product, item.quantity - 1)}
                            aria-label={`Decrease quantity of ${item.product?.name || 'product'}`}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={15} />
                          </button>
                          <span aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            className="yb-qty-button"
                            onClick={() => handleQuantityChange(item.product?._id || item.product, item.quantity + 1)}
                            aria-label={`Increase quantity of ${item.product?.name || 'product'}`}
                            disabled={item.product?.stock != null && item.quantity >= item.product.stock}
                          >
                            <Plus size={15} />
                          </button>
                        </div>

                        <strong className="yb-cart-subtotal" aria-label="Item subtotal">
                          {formatPrice((item.product?.price || 0) * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="col-lg-4">
              <aside className="yb-cart-summary" aria-label="Order summary">
                <span className="yb-cart-summary-kicker">A little bundle of joy</span>
                <h3>Order summary</h3>

                <div className="yb-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatPrice(cartTotal)}</strong>
                </div>

                <div className="yb-summary-row">
                  <span>Shipping</span>
                  <strong>{shipping === 0 ? 'Free' : formatPrice(shipping)}</strong>
                </div>

                <div className="yb-summary-row yb-summary-row-total">
                  <span>Total</span>
                  <strong>{formatPrice(total)}</strong>
                </div>

                <Link to="/checkout" className="yb-btn yb-btn-primary yb-summary-button">
                  Proceed to checkout
                  <ArrowRight size={17} />
                </Link>

                <Link to="/shop" className="yb-btn yb-btn-outline yb-summary-button">
                  Continue shopping
                </Link>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
