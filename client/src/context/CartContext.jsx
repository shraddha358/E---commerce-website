import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CART': return { ...state, items: action.payload.items, subtotal: action.payload.subtotal, loading: false };
    case 'SET_LOADING': return { ...state, loading: action.payload };
    case 'CLEAR': return { ...state, items: [], subtotal: 0 };
    default: return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, { items: [], subtotal: 0, loading: false });
  const { user } = useAuth();

  const fetchCart = useCallback(async () => {
    if (!user) { dispatch({ type: 'CLEAR' }); return; }
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: 'SET_CART', payload: { items: data.items, subtotal: data.subtotal } });
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const { data } = await cartAPI.add({ product_id: productId, quantity });
      dispatch({ type: 'SET_CART', payload: { items: data.items, subtotal: data.items.reduce((s, i) => s + (parseFloat(i.discount_price || i.price) * i.quantity), 0) } });
      toast.success('Added to cart!');
      return { success: true };
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return { success: false };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    try {
      const { data } = await cartAPI.update(cartItemId, { quantity });
      dispatch({ type: 'SET_CART', payload: { items: data.items, subtotal: data.items.reduce((s, i) => s + (parseFloat(i.discount_price || i.price) * i.quantity), 0) } });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeItem = async (cartItemId) => {
    try {
      const { data } = await cartAPI.remove(cartItemId);
      dispatch({ type: 'SET_CART', payload: { items: data.items, subtotal: data.items.reduce((s, i) => s + (parseFloat(i.discount_price || i.price) * i.quantity), 0) } });
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      dispatch({ type: 'CLEAR' });
    } catch {}
  };

  const itemCount = state.items.reduce((s, i) => s + i.quantity, 0);
  const shippingCharge = state.subtotal >= 500 ? 0 : state.subtotal > 0 ? 49 : 0;
  const total = state.subtotal + shippingCharge;

  return (
    <CartContext.Provider value={{ ...state, itemCount, shippingCharge, total, addToCart, updateQuantity, removeItem, clearCart, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
