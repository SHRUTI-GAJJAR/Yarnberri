import { useEffect, useState } from 'react';
import { ArrowRight, Package, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import WishlistButton from '../common/WishlistButton';

const formatPrice = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

// Categories are stored as slugs (`hair-accessories`). Every other surface
// already title-cases them, so the card does too rather than printing a
// bare lowercase slug next to a Title Case product name.
const formatCategory = (value) =>
  String(value || 'Handmade')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(Array.isArray(response?.products) ? response.products : []);
      } catch (error) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const featuredProducts = products.slice(0, 4);

  return (
    <section className="yb-section yb-featured-section">
      <div className="container">
        <div className="yb-section-heading yb-featured-heading">
          <div>
            <div className="yb-eyebrow">
              <Sparkles size={14} />
              Featured finds
            </div>
            <h2 className="yb-section-title">Fresh from the Yarnberri studio</h2>
          </div>

          <Link to="/shop" className="yb-inline-link">
            View all products
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Package size={28} />
              <p>Loading handcrafted favourites...</p>
            </div>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Package size={28} />
              <p>No products are available yet. Check back soon for new handmade drops.</p>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {featuredProducts.map((product) => (
              <div key={product._id} className="col-md-6 col-xl-3">
                <div className="yb-product-card-shell">
                  <WishlistButton product={product} className="yb-featured-wishlist" />
                  <Link to={`/product/${product._id}`} className="yb-product-card">
                    <div className="yb-product-image">
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="yb-product-fallback" aria-hidden="true" />
                      )}
                    </div>

                    <div className="yb-product-body">
                      <div className="yb-product-topline">
                        <span className="yb-chip">
                          {product.readyToShip ? 'Ready to ship' : 'Made to order'}
                        </span>
                        <span className="yb-product-price">{formatPrice(product.price)}</span>
                      </div>

                      <h3>{product.name}</h3>

                      <div className="yb-product-meta">
                        <span>{product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}</span>
                        <span>{formatCategory(product.category)}</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
