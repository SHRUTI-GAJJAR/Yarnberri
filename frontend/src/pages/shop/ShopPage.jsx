import { useEffect, useMemo, useState } from 'react';
import { Search, ShoppingBag, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import WishlistButton from '../../components/common/WishlistButton';
import { Button } from '@/components/ui/button';
import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';
import { Input } from '@/components/ui/input';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotifications } from '../../context/NotificationContext';
import { categories as collections, categoryThumbs } from '../../data/categories';

// Slugs shown as filter pills. These come from the shared collection list, so
// this page and the home page cards always agree on which collections exist.
const supportedCategories = collections.map((collection) => collection.slug);

/**
 * Categories deliberately kept out of the filter row.
 *
 * Nothing is hidden right now - the 'Crochet Flowers' duplicate was fixed at the
 * source instead, by giving that collection the 'flowers' slug the backend
 * actually stores (see data/categories.js). Kept as a named set rather than an
 * inline check so a future category can be retired without re-reading the whole
 * memo above.
 */
const hiddenCategories = new Set();

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

export default function ShopPage() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { notify } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [addingProductId, setAddingProductId] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(requestedSearch);

  useEffect(() => {
    setSearchTerm(requestedSearch);
  }, [requestedSearch]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts();
        setProducts(Array.isArray(response?.products) ? response.products : []);
      } catch (error) {
        setProducts([]);
        setLoadError(error?.response?.data?.message || 'We could not load the collection. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const unique = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return ['All', ...new Set([...supportedCategories, ...unique])].filter(
      (category) => !hiddenCategories.has(category)
    );
  }, [products]);

  const requestedCategory = searchParams.get('category');
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : 'All';

  const handleCategoryChange = (category) => {
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (category === 'All') {
        nextParams.delete('category');
      } else {
        nextParams.set('category', category);
      }

      return nextParams;
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      if (query) {
        nextParams.set('search', query);
      } else {
        nextParams.delete('search');
      }
      return nextParams;
    }, { replace: true });
  };

  // Drops `search` from the URL while leaving `category` untouched, so
  // clearing the text inside a category keeps the category filter applied.
  const clearSearch = () => {
    setSearchTerm('');

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.delete('search');
      return nextParams;
    }, { replace: true });
  };

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !query ||
        product.name?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;

      return matchesQuery && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddToCart = async (product) => {
    if (!user) {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }

    if (product.stock <= 0 || addingProductId === product._id) {
      return;
    }

    setAddingProductId(product._id);
    try {
      await addToCart(product._id, 1);
      notify(`${product.name} added to your bag.`, 'success');
    } catch (error) {
      notify(error?.response?.data?.message || 'Unable to add this item to your cart.', 'error');
    } finally {
      setAddingProductId('');
    }
  };

  return (
    <section className="yb-shop-page yb-section">
      <div className="container">
        <div className="yb-shop-banner">
          <div>
            <div className="yb-eyebrow">
              <Sparkles size={14} />
              Shop all crochet favourites
            </div>
            <h1 className="yb-shop-title">Handmade pieces made to gift, keep, and adore.</h1>
          </div>
          <div className="yb-shop-badge">
            <SlidersHorizontal size={16} />
            {products.length} pieces available
          </div>
        </div>

        <div className="yb-shop-toolbar">
          <form className="yarnberri-search-shop" role="search" onSubmit={handleSearchSubmit}>
            <ButtonGroup
              className="yarnberri-search-group--shop"
              data-has-value={searchTerm.trim() ? 'true' : 'false'}
              aria-label="Search products"
            >
              <Button
                type="submit"
                className="yarnberri-search-btn-lead"
                aria-label="Search products"
                title="Search products"
              >
                <Search size={17} strokeWidth={1.8} />
              </Button>

              <Input
                aria-label="Search products"
                type="text"
                enterKeyHint="search"
                placeholder="Search by name, category, or style"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  // Escape clears the field without touching the category.
                  if (event.key !== 'Escape' || !searchTerm) return;

                  event.preventDefault();
                  clearSearch();
                }}
              />

              {searchTerm.trim() && (
                <>
                  <ButtonGroupSeparator />
                  <Button
                    type="button"
                    className="yarnberri-search-btn-clear"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X size={16} strokeWidth={2} />
                  </Button>
                </>
              )}
            </ButtonGroup>
          </form>

          <div className="yb-filter-pills" aria-label="Filter products by category">
            {categories.map((category) => {
              // 'All' is a pseudo-category and has no artwork. Any other slug
              // without a thumbnail is a category that only exists in the
              // database (categories added via the admin dashboard before this
              // artwork existed) - it renders as a text-only pill rather than a
              // broken image.
              const thumb = category === 'All' ? undefined : categoryThumbs[category];

              return (
                <button
                  key={category}
                  type="button"
                  className={`yb-filter-pill ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category)}
                  aria-pressed={selectedCategory === category}
                >
                  {thumb && (
                    <img
                      className="yb-filter-pill__icon"
                      src={thumb}
                      alt=""
                      aria-hidden="true"
                      width="20"
                      height="20"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  <span className="yb-filter-pill__label">
                    {category === 'All' ? 'All' : formatCategory(category)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div className="yb-empty-state">
            <div className="yb-empty-card">
              <Search size={28} />
              <p>Loading the curated collection...</p>
            </div>
          </div>
        ) : loadError ? (
          <div className="yb-empty-state" role="alert">
            <div className="yb-empty-card">
              <Sparkles size={28} />
              <p>{loadError}</p>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="yb-empty-state" role="status">
            <div className="yb-empty-card">
              <Sparkles size={28} />
              <p>
                {products.length === 0
                  ? 'There are no handmade pieces in the shop just yet. Please check back soon.'
                  : searchTerm.trim()
                    ? `No products match “${searchTerm.trim()}”. Try another search or category.`
                    : 'No products match this category right now. Try another category or check back soon.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="row g-4 yb-shop-grid" aria-label="Shop products">
            {filteredProducts.map((product) => (
              <div key={product._id} className="col-6 col-md-6 col-xl-3">
                <div className="yb-shop-card-shell">
                  <WishlistButton product={product} className="yb-shop-wishlist" />
                  <article className="yb-shop-card">
                    <Link to={`/product/${product._id}`} className="yb-shop-image-wrap" aria-label={`View ${product.name}`}>
                      {product.images?.[0] ? (
                        <img src={product.images[0]} alt={product.name} />
                      ) : (
                        <div className="yb-shop-image-fallback" aria-hidden="true" />
                      )}
                      <span className="yb-shop-tag">
                        {product.readyToShip ? 'Ready to ship' : 'Made to order'}
                      </span>
                    </Link>

                    <div className="yb-shop-product-body">
                      <div className="yb-shop-product-info">
                        <span className="yb-shop-category">{formatCategory(product.category)}</span>
                        <Link to={`/product/${product._id}`} className="yb-shop-product-name">
                          <h2>{product.name}</h2>
                        </Link>
                        <p>{product.readyToShip ? 'Ready to ship' : product.preparationTime || 'Made to order'}</p>
                      </div>

                      <div className="yb-shop-price-row">
                        <strong>{formatPrice(product.price)}</strong>
                        <span className={product.stock > 0 ? 'in-stock' : 'sold-out'}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Sold out'}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="yb-shop-add-to-cart"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock <= 0 || addingProductId === product._id}
                        aria-label={product.stock <= 0 ? `${product.name} is sold out` : `Add ${product.name} to cart`}
                      >
                        <ShoppingBag size={17} aria-hidden="true" />
                        {product.stock <= 0
                          ? 'Sold Out'
                          : addingProductId === product._id
                            ? 'Adding...'
                            : 'Add to Cart'}
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
