import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as wishlistService from '../services/wishlistService';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

const productIdOf = (product) => String(product?._id || product?.id || '');

export function WishlistProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inFlightAdds = useRef(new Map());

  const refreshWishlist = useCallback(async () => {
    if (!user) {
      setProducts([]);
      setError('');
      setLoading(false);
      return [];
    }

    setLoading(true);
    setError('');
    try {
      const response = await wishlistService.getWishlist();
      const nextProducts = Array.isArray(response?.products) ? response.products : [];
      setProducts(nextProducts);
      return nextProducts;
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Unable to load your wishlist right now.');
      throw requestError;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProducts([]);
      setError('');
      setLoading(false);
      return;
    }

    let isCurrentUser = true;
    setLoading(true);
    setError('');
    wishlistService.getWishlist()
      .then((response) => {
        if (isCurrentUser) {
          setProducts(Array.isArray(response?.products) ? response.products : []);
        }
      })
      .catch((requestError) => {
        if (isCurrentUser) {
          setError(requestError?.response?.data?.message || 'Unable to load your wishlist right now.');
        }
      })
      .finally(() => {
        if (isCurrentUser) setLoading(false);
      });

    return () => {
      isCurrentUser = false;
    };
  }, [authLoading, user]);

  const addToWishlist = useCallback((productId) => {
    if (!user) {
      return Promise.reject(new Error('Sign in to save products to your wishlist.'));
    }
    const id = String(productId);
    if (!id) return Promise.reject(new Error('A product is required to update your wishlist.'));

    const existingRequest = inFlightAdds.current.get(id);
    if (existingRequest) return existingRequest;

    const alreadySaved = products.some((product) => productIdOf(product) === id);
    if (alreadySaved) return Promise.resolve();

    const request = wishlistService.addToWishlist(id)
      .then((response) => {
        if (response?.product) {
          setProducts((current) => (
            current.some((product) => productIdOf(product) === id)
              ? current
              : [...current, response.product]
          ));
        }
        setError('');
        return response;
      })
      .finally(() => inFlightAdds.current.delete(id));

    inFlightAdds.current.set(id, request);
    return request;
  }, [products, user]);

  const removeFromWishlist = useCallback(async (productId) => {
    if (!user) {
      throw new Error('Sign in to manage your wishlist.');
    }
    const id = String(productId);
    await wishlistService.removeFromWishlist(id);
    setProducts((current) => current.filter((product) => productIdOf(product) !== id));
    setError('');
  }, [user]);

  const wishlistProducts = user ? products : [];
  const wishlistIds = useMemo(
    () => new Set(wishlistProducts.map(productIdOf).filter(Boolean)),
    [wishlistProducts]
  );

  const value = useMemo(() => ({
    products: wishlistProducts,
    productIds: wishlistIds,
    count: wishlistProducts.length,
    loading: authLoading || loading,
    error: user ? error : '',
    isInWishlist: (productId) => wishlistIds.has(String(productId)),
    addToWishlist,
    removeFromWishlist,
    toggleWishlist: (productId) => (
      wishlistIds.has(String(productId))
        ? removeFromWishlist(productId)
        : addToWishlist(productId)
    ),
    refreshWishlist,
  }), [wishlistProducts, wishlistIds, authLoading, loading, error, user, addToWishlist, removeFromWishlist, refreshWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used inside a WishlistProvider');
  }
  return context;
}
