import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as cartService from '../services/cartService';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = async () => {
    if (!user) {
      setItems([]);
      setTotalItems(0);
      setCartTotal(0);
      return;
    }

    try {
      setLoading(true);
      const response = await cartService.getCart();
      setItems(response.items || []);
      setTotalItems(response.totalItems || 0);
      setCartTotal(response.cartTotal || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [user]);

  const addToCart = async (productId, quantity = 1) => {
    const response = await cartService.addToCart(productId, quantity);
    await fetchCart();
    return response;
  };

  const updateQuantity = async (productId, quantity) => {
    const response = await cartService.updateCartQuantity(productId, quantity);
    await fetchCart();
    return response;
  };

  const removeFromCart = async (productId) => {
    const response = await cartService.removeFromCart(productId);
    await fetchCart();
    return response;
  };

  const value = useMemo(
    () => ({
      items,
      totalItems,
      cartTotal,
      loading,
      fetchCart,
      addToCart,
      updateQuantity,
      removeFromCart,
    }),
    [items, totalItems, cartTotal, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }

  return context;
}
