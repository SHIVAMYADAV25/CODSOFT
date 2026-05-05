import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0 });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!user) { setCart({ items: [], subtotal: 0 }); return; }
    try {
      setLoading(true);
      const { data } = await api.get('/cart');
      setCart(data.cart);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data.cart);
    return data;
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete(`/cart/${productId}`);
    setCart(data.cart);
  };

  const updateItem = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    const { data } = await api.post('/cart', { productId, quantity });
    setCart(data.cart);
  };

  const clearCart = async () => {
    await api.delete('/cart');
    setCart({ items: [], subtotal: 0 });
  };

  const itemCount = cart.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

  const subtotal = cart.items?.reduce((sum, i) => {
    const price = i.product?.price || i.price || 0;
    return sum + price * i.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider value={{ cart, loading, addItem, removeItem, updateItem, clearCart, itemCount, subtotal, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
