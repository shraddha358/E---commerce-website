import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!user) { setItems([]); return; }
    try {
      const { data } = await wishlistAPI.get();
      setItems(data.items);
    } catch {}
  }, [user]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    try {
      const { data } = await wishlistAPI.toggle(productId);
      if (data.wishlisted) {
        toast.success('Added to wishlist');
      } else {
        toast.success('Removed from wishlist');
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
      }
      await fetchWishlist();
      return data.wishlisted;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
      return false;
    }
  };

  const isWishlisted = (productId) => items.some((i) => i.product_id === productId);

  return (
    <WishlistContext.Provider value={{ items, loading, toggleWishlist, isWishlisted, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
