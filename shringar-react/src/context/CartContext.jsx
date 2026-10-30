import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';
import { CouponsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();

  const currentUserId = user?.id ? String(user.id) : 'guest';
  const loadedUserRef = useRef(currentUserId);

  const getCartKey = (uid) => (uid ? `shringar_cart_user_${uid}` : 'shringar_cart_guest');
  const getCouponKey = (uid) => (uid ? `shringar_coupon_user_${uid}` : 'shringar_coupon_guest');
  const getPkgKey = (uid) => (uid ? `shringar_pkg_user_${uid}` : 'shringar_pkg_guest');

  // Cart items state, initialized from isolated user storage
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(getCartKey(user?.id));
      if (saved) return JSON.parse(saved);
      // Migration check only for guest
      if (!user?.id) {
        const legacy = localStorage.getItem('shringar_cart');
        return legacy ? JSON.parse(legacy) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Coupon handling isolated per user
  const [coupon, setCoupon] = useState(() => {
    try {
      const saved = localStorage.getItem(getCouponKey(user?.id));
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [packageType, setPackageType] = useState(() => {
    try {
      return localStorage.getItem(getPkgKey(user?.id)) || 'AUTO';
    } catch {
      return 'AUTO';
    }
  });

  // Reload user-scoped data specifically when authenticated user changes (login / logout / switch account)
  useEffect(() => {
    if (loadedUserRef.current !== currentUserId) {
      loadedUserRef.current = currentUserId;

      // 1. Load cart
      try {
        const saved = localStorage.getItem(getCartKey(user?.id));
        setCartItems(saved ? JSON.parse(saved) : []);
      } catch {
        setCartItems([]);
      }

      // 2. Load coupon
      try {
        const savedCoupon = localStorage.getItem(getCouponKey(user?.id));
        setCoupon(savedCoupon ? JSON.parse(savedCoupon) : null);
      } catch {
        setCoupon(null);
      }

      // 3. Load package type
      try {
        const savedPkg = localStorage.getItem(getPkgKey(user?.id)) || 'AUTO';
        setPackageType(savedPkg);
      } catch {
        setPackageType('AUTO');
      }
    }
  }, [currentUserId, user?.id]);

  // Persist cart ONLY when cartItems belongs to the current user
  useEffect(() => {
    if (loadedUserRef.current === currentUserId) {
      const key = getCartKey(user?.id);
      try {
        localStorage.setItem(key, JSON.stringify(cartItems));
      } catch {
        // ignore storage errors
      }
    }
  }, [cartItems, currentUserId, user?.id]);

  // Persist coupon ONLY when belonging to current user
  useEffect(() => {
    if (loadedUserRef.current === currentUserId) {
      const key = getCouponKey(user?.id);
      try {
        if (coupon) {
          localStorage.setItem(key, JSON.stringify(coupon));
        } else {
          localStorage.removeItem(key);
        }
      } catch {}
    }
  }, [coupon, currentUserId, user?.id]);

  const addToCart = (design, quantityToAdd = 1, showToast = true) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === design.id);
      if (exists) {
        const newQty = (exists.quantity || 1) + quantityToAdd;
        // Do not spam toast when incrementing quantity
        return prev.map((item) =>
          item.id === design.id ? { ...item, quantity: newQty } : item
        );
      }
      if (showToast) {
        toast.success(`Added "${design.name}" to your booking package.`);
      }
      return [...prev, { ...design, quantity: Math.max(1, quantityToAdd) }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id, true);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.min(99, Math.max(1, Math.round(newQuantity))) } : item
      )
    );
  };

  const removeFromCart = (id, silent = false) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    if (!silent) {
      toast.info('Item removed from cart.');
    }
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
    try {
      localStorage.removeItem(getCartKey(user?.id));
      localStorage.removeItem(getCouponKey(user?.id));
    } catch {}
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
    if (coupon.discountAmount != null && Number(coupon.discountAmount) > 0) {
      discountAmount = Math.min(Number(coupon.discountAmount), subtotal);
    } else if (coupon.discountType === 'PERCENT' || coupon.type === 'PERCENT' || coupon.discountPercent) {
      const pct = Number(coupon.discountPercent || coupon.value || coupon.discountValue || 10);
      discountAmount = Math.round((subtotal * pct) / 100);
      if (coupon.maxDiscount && Number(coupon.maxDiscount) > 0 && discountAmount > Number(coupon.maxDiscount)) {
        discountAmount = Number(coupon.maxDiscount);
      }
    } else if (coupon.discountValue || coupon.value) {
      discountAmount = Math.min(Number(coupon.discountValue || coupon.value), subtotal);
    }
  }

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const applyCouponCode = async (code) => {
    if (!code || !code.trim()) {
      toast.error('Please enter a coupon code.');
      return false;
    }
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await CouponsAPI.validate(cleanCode, subtotal);
      const validated = res?.data || res;
      if (validated) {
        setCoupon(validated);
        toast.success(`Coupon "${cleanCode}" applied successfully!`);
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Invalid or expired coupon code.');
      return false;
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    toast.info('Coupon removed.');
  };

  const itemCount = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

  // Detect if any design in cart is explicitly a Bridal / Dulhan creation
  const hasBridalDesign = cartItems.some((item) => {
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return cat.includes('bridal') || name.includes('bridal') || name.includes('dulhan');
  });

  // Existing package logic (preserved as originally)
  const isBridalPackage = packageType === 'BRIDAL' || hasBridalDesign;
  const isGroupPackage = packageType === 'GROUP' && !hasBridalDesign;
  const effectivePackageType = packageType === 'AUTO' ? (hasBridalDesign ? 'BRIDAL' : 'GROUP') : packageType;

  // Placeholder for derived values used downstream (original code defines these later)
  const requiredArtists = 1; // default placeholder
  const bridalPackageDetails = {};

  const handleSetPackageType = (type) => {
    setPackageType(type);
    try {
      localStorage.setItem(getPkgKey(user?.id), type);
    } catch {}
    if (type === 'BRIDAL') {
      toast.success('Royal Bridal Package selected! (1 Dedicated Bride Artist + 1 Artist per 3 relatives)');
    } else {
      toast.info('Standard Group Package selected (1 Artist for every 3 guests)');
    }
  };

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
        packageType,
        setPackageType,
        handleSetPackageType,
        effectivePackageType,
        isBridalPackage,
        isGroupPackage,
        requiredArtists,
        bridalPackageDetails,
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
