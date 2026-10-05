import { useEffect, useState } from 'react';
import { ArrowLeft, Minus, Plus, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import WishlistButton from '../../components/common/WishlistButton';
import { getProductById } from '../../services/productService';

const formatCategory = (value) =>
  String(value || 'Handmade')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { notify } = useNotifications();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      try {
        const response = await getProductById(productId);
        if (isMounted) {
          setProduct(response?.product || null);
        }
      } catch (error) {
        if (isMounted) {
          setProduct(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  useEffect(() => {
    if (product) {
      setQuantity((current) => Math.min(Math.max(1, current), product.stock > 0 ? product.stock : 1));
      setSelectedImageIndex(0);
    }
  }, [product]);

  const handleQuantityChange = (nextQty) => {
    if (!product) {
      return;
    }

    const maxQty = Math.max(product.stock || 0, 1);
    setQuantity(Math.min(Math.max(1, nextQty), maxQty));
  };

  const handleAddToCart = async () => {
    if (!product) {
      return;
    }

    if (!user) {
      navigate('/login');
      return;
    }

    if (product.stock <= 0) {
      notify('This piece is sold out right now.', 'error');
      return;
    }

    try {
      await addToCart(product._id, quantity);
      notify(`${product.name} added to your bag.`, 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to add this item to your cart.', 'error');
    }
  };

  if (loading) {
    return (
      <section className="yb-section">
        <div className="container">
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Sparkles size={28} />
              <p>Loading this handmade piece...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="yb-section">
        <div className="container">
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Sparkles size={28} />
              <p>We couldn’t find that product. Let’s take you back to the shop.</p>
              <Link to="/shop" className="yb-btn yb-btn-primary">
                Back to shop
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const galleryImages = Array.isArray(product.images) && product.images.length > 0 ? product.images : [];
  const primaryImage = galleryImages[selectedImageIndex];

  return (
    <section className="yb-product-page yb-section">
      <div className="container">
        <Link to="/shop" className="yb-inline-link yb-product-back-link">
          <ArrowLeft size={16} />
          Back to shop
        </Link>

        <div className="row g-5 align-items-start">
          <div className="col-lg-6">
            <div className="yb-product-gallery">
              <div className="yb-product-main-image">
                {primaryImage ? (
                  <img src={primaryImage} alt={product.name} />
                ) : (
                  <div className="yb-product-fallback" aria-hidden="true" />
                )}
              </div>

              {galleryImages.length > 1 && (
                <div className="yb-product-thumbs" role="group" aria-label="Product images">
                  {galleryImages.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`yb-product-thumb ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                      aria-label={`Show product image ${index + 1}`}
                      aria-pressed={selectedImageIndex === index}
                    >
                      <img src={image} alt={`${product.name} detail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="col-lg-6">
            <div className="yb-product-details">
              <div className="yb-eyebrow">
                <Sparkles size={14} />
                {formatCategory(product.category)}
              </div>

              <h1 className="yb-product-title">{product.name}</h1>

              <div className="yb-product-price-row">
                <span className="yb-product-price-large">{formatPrice(product.price)}</span>
                <span className={`yb-product-status ${product.stock > 0 ? 'in-stock' : 'sold-out'}`}>
                  {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                </span>
              </div>

              <p className="yb-product-description">{product.description}</p>

              <div className="yb-product-meta-list">
                <div className="yb-product-meta-item">
                  <span className="yb-product-label">Shipping</span>
                  <strong>{product.readyToShip ? 'Ready to ship' : 'Made to order'}</strong>
                </div>

                <div className="yb-product-meta-item">
                  <span className="yb-product-label">Care</span>
                  <strong>{product.readyToShip ? 'Packed with love' : product.preparationTime || 'Handmade after order'}</strong>
                </div>
              </div>

              <div className="yb-product-qty-row">
                <span>Quantity</span>
                <div className="yb-qty-picker">
                  <button
                    type="button"
                    className="yb-qty-button"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={16} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    type="button"
                    className="yb-qty-button"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="yb-product-cta-row">
                <WishlistButton product={product} className="yb-product-detail-wishlist" />
                <button
                  type="button"
                  className="yb-btn yb-btn-primary"
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                >
                  <ShoppingBag size={18} />
                  {product.stock > 0 ? 'Add to cart' : 'Sold out'}
                </button>

                <Link to="/shop" className="yb-btn yb-btn-outline">
                  Continue shopping
                </Link>
              </div>

              <div className="yb-product-trust">
                <div className="yb-product-trust-item">
                  <Truck size={18} />
                  <span>Handpacked in small batches for gifting.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
