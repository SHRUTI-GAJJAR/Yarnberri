import { useState } from 'react';
import { ArrowRight, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { useWishlist } from '../../context/WishlistContext';
import WishlistButton from '../../components/common/WishlistButton';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const { products, loading, error, refreshWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { notify } = useNotifications();
  const [addingProductId, setAddingProductId] = useState('');

  const handleAddToCart = async (product) => {
    setAddingProductId(product._id);
    try {
      await addToCart(product._id, 1);
      notify(`${product.name} added to your bag.`, 'success');
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to add this item to your cart.', 'error');
    } finally {
      setAddingProductId('');
    }
  };

  const handleRefresh = async () => {
    try {
      await refreshWishlist();
    } catch (requestError) {
      notify(requestError?.response?.data?.message || 'Unable to load your wishlist right now.', 'error');
    }
  };

  if (authLoading || (user && loading && products.length === 0)) {
    return (
      <section className="yb-section yb-wishlist-page">
        <div className="container">
          <div className="yb-empty-state" role="status">
            <div className="yb-empty-card">
              <Heart size={28} aria-hidden="true" />
              <p>Loading your saved favourites...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="yb-section yb-wishlist-page">
        <div className="container">
          <div className="yb-page-heading">
            <span className="yb-eyebrow"><Heart size={14} aria-hidden="true" /> Your saved favourites</span>
            <h1 className="yb-section-title">Wishlist</h1>
          </div>
          <div className="yb-page-empty">
            <Heart size={30} aria-hidden="true" />
            <h2>Sign in to view your wishlist</h2>
            <p>Your saved handmade favourites are linked to your account and will be here when you sign in.</p>
            <div className="yb-wishlist-login-actions">
              <Link to="/login?redirect=%2Fwishlist" className="yb-btn yb-btn-primary">Sign in</Link>
              <Link to="/register?redirect=%2Fwishlist" className="yb-btn yb-btn-outline">Create an account</Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="yb-section yb-wishlist-page">
      <div className="container">
        <div className="yb-page-heading">
          <span className="yb-eyebrow"><Heart size={14} aria-hidden="true" /> Your saved favourites</span>
          <h1 className="yb-section-title">Wishlist</h1>
        </div>

        {error ? (
          <div className="yb-page-empty" role="alert">
            <Heart size={30} aria-hidden="true" />
            <h2>We couldn’t load your wishlist.</h2>
            <p>{error}</p>
            <button type="button" className="yb-btn yb-btn-primary" onClick={handleRefresh}>
              Try again
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="yb-page-empty">
            <Heart size={30} aria-hidden="true" />
            <h2>Your handmade favourites are waiting.</h2>
            <p>Save pieces you love and they’ll appear here.</p>
            <Link to="/shop" className="yb-btn yb-btn-primary">
              Browse products <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="row g-4 yb-wishlist-grid">
            {products.map((product) => (
              <div key={product._id} className="col-6 col-md-6 col-xl-3">
                <article className="yb-wishlist-card">
                  <div className="yb-wishlist-card-image">
                    <Link to={`/product/${product._id}`} aria-label={`View ${product.name}`}>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <span className="yb-shop-image-fallback" aria-hidden="true" />
                      )}
                    </Link>
                    <WishlistButton product={product} className="yb-wishlist-remove" />
                  </div>

                  <div className="yb-wishlist-card-body">
                    <Link to={`/product/${product._id}`} className="yb-wishlist-product-link">
                      <h2>{product.name}</h2>
                    </Link>
                    <strong>{formatPrice(product.price)}</strong>
                    <span className={`yb-wishlist-stock ${product.stock > 0 ? 'in-stock' : 'sold-out'}`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                    </span>
                    <button
                      type="button"
                      className="yb-btn yb-btn-primary yb-wishlist-cart-button"
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock <= 0 || addingProductId === product._id}
                    >
                      <ShoppingBag size={16} />
                      {addingProductId === product._id ? 'Adding...' : product.stock > 0 ? 'Add to cart' : 'Sold out'}
                    </button>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
