// @refresh reset
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const addToCart = (item, quantity = 1, isLoggedIn = false, locationName = null) => {
    if (!isLoggedIn) {
      setShowSignInPopup(true);
      return { success: false, message: "Please sign in first" };
    }

    if (!locationName) {
      setShowLocationPopup(true);
      return { success: false, message: "Please set your location" };
    }

    // ✅ تحويل الـ ID لـ string
    const itemId = String(item.id);
    
    if (!itemId || itemId === "undefined") {
      console.error("❌ Item ID missing");
      return { success: false, message: "Error: Item ID missing" };
    }

    // ✅ الكمية المتاحة من الـ API
    const maxQuantity = item.quantity || 0;

    let result = { success: false, message: "" };

    setCartItems((prev) => {
      const existing = prev.find((i) => String(i.id) === itemId);

      if (existing) {
        const newQuantity = existing.quantity + quantity;
        
        // ✅ لا تضيف إذا تجاوز الكمية المتاحة
        if (newQuantity > maxQuantity) {
          result = { 
            success: false, 
            message: `❌ Only ${maxQuantity} available! You already have ${existing.quantity} in cart.` 
          };
          console.warn(result.message);
          return prev;
        }

        result = { success: true, message: "✅ Added to Cart!" };
        return prev.map((i) =>
          String(i.id) === itemId ? { ...i, quantity: newQuantity } : i
        );
      }

      // ✅ للمنتج الجديد
      if (quantity > maxQuantity) {
        result = { 
          success: false, 
          message: `❌ Only ${maxQuantity} item(s) available!` 
        };
        console.warn(result.message);
        return prev;
      }

      result = { success: true, message: "✅ Added to Cart!" };
      const newItem = { ...item, id: itemId, quantity };
      return [...prev, newItem];
    });

    return result;
  };

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        showSignInPopup,
        setShowSignInPopup,
        showLocationPopup,
        setShowLocationPopup,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
