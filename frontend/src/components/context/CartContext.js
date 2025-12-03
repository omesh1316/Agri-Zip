import React, { createContext, useState, useContext, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart_items") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("cart_items", JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    setItems(prev => {
      const found = prev.find(i => i.product.id === product.id);
      if (found) {
        return prev.map(i => i.product.id === product.id ? { ...i, qty: Math.min(product.stock || 9999, i.qty + qty) } : i);
      }
      return [{ product, qty: Math.min(product.stock || 9999, qty) }, ...prev];
    });
  };

  const updateQty = (productId, qty) =>
    setItems(prev => prev.map(i => i.product.id === productId ? { ...i, qty } : i));

  const remove = (productId) => setItems(prev => prev.filter(i => i.product.id !== productId));
  const clear = () => setItems([]);
  const total = items.reduce((s, i) => s + (i.product.price || 0) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, remove, clear, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);