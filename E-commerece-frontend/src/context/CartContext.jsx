import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { cartApi } from '../api/cartApi';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setCart(await cartApi.get());
    } catch {
      setCart(null);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const itemCount = useMemo(
    () => cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0,
    [cart]
  );

  const addToCart = async (productId, quantity = 1) =>
    setCart(await cartApi.addItem(productId, quantity));

  const updateQuantity = async (productId, quantity) =>
    setCart(await cartApi.updateItem(productId, quantity));

  const removeFromCart = async (productId) =>
    setCart(await cartApi.removeItem(productId));

  const clearCart = async () => {
    await cartApi.clear();
    await refreshCart();
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);