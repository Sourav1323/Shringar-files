import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { CouponsAPI } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('shringar_react_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem('shringar_react_coupon');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const toast = useToast();

  useEffect(() => {
    localStorage.setItem('shringar_react_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('shringar_react_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('shringar_react_coupon');
    }
  }, [coupon]);

  const addToCart = (design, quantityToAdd = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === design.id);
      if (exists) {
        const newQty = (exists.quantity || 1) + quantityToAdd;
        toast.success(`Increased "${design.name}" quantity to ${newQty}!`);
        return prev.map((item) =>
          item.id === design.id ? { ...item, quantity: newQty } : item
        );
      }
      toast.success(`Added "${design.name}" to your booking package.`);
      return [...prev, { ...design, quantity: Math.max(1, quantityToAdd) }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(99, Math.max(1, Math.round(newQuantity))) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info('Item removed from cart.');
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  const totalCones = cartItems.reduce(
    (sum, item) => sum + (Number(item.conesNeeded) || 1) * (Number(item.quantity) || 1),
    0
  );

  const totalDurationHours = Math.round(
    cartItems.reduce(
      (sum, item) =>
        sum +
        (((Number(item.durationMinHours) || 1) + (Number(item.durationMaxHours) || 2)) / 2) *
          (Number(item.quantity) || 1),
      0
    ) * 10
  ) / 10;

  let discountAmount = 0;
  if (coupon && subtotal > 0) {
    if (coupon.discountType === 'PERCENT' || coupon.discountPercent) {
      const pct = coupon.discountPercent || coupon.discountValue || 10;
      discountAmount = Math.round((subtotal * pct) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountValue) {
      discountAmount = Math.min(coupon.discountValue, subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      toast.error('Please enter a coupon code.');
      return;
    }
    const cleanCode = code.trim().toUpperCase();

    try {
      const validated = await CouponsAPI.validate(cleanCode, subtotal);
      if (validated) {
        setCoupon(validated);
        toast.success(`Coupon "${cleanCode}" applied successfully! 🎉`);
      }
    } catch (err) {
      // Fallback local matching if API offline
      if (cleanCode === 'SHRINGAR20') {
        const fakeCoupon = { code: 'SHRINGAR20', discountPercent: 20, description: '20% Welcome Discount' };
        setCoupon(fakeCoupon);
        toast.success('Coupon "SHRINGAR20" applied! (20% off) 🎉');
      } else {
        toast.error(err.message || 'Invalid or expired coupon code.');
      }
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.info('Coupon removed.');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        applyCouponCode,
        removeCoupon,
        subtotal,
        discountAmount,
        finalTotal,
        totalCones,
        totalDurationHours,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
