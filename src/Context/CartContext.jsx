import { createContext, useContext, useState } from "react";

const CartContext = createContext();

function ConflictDialog({ currentVendor, newVendor, onClear, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "white", borderRadius: "16px", padding: "2rem",
        maxWidth: "360px", width: "90%", textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
      }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛒</div>
        <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937", fontSize: "1.1rem", fontWeight: 700 }}>
          Different Restaurant
        </h3>
        <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
          Your cart has items from <strong style={{ color: "#111827" }}>{currentVendor}</strong>.
          <br />
          Clear cart and add from <strong style={{ color: "#10b981" }}>{newVendor}</strong>?
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb",
              borderRadius: "8px", background: "white", color: "#374151",
              fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onClear}
            style={{
              flex: 1, padding: "0.65rem", border: "none",
              borderRadius: "8px", background: "#10b981", color: "white",
              fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
            }}
          >
            Clear & Add
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartVendorId, setCartVendorId] = useState(null);
  const [cartBranchId, setCartBranchId] = useState(null);
  const [cartVendorName, setCartVendorName] = useState("");

  const [showSignInPopup, setShowSignInPopup] = useState(false);
  const [showLocationPopup, setShowLocationPopup] = useState(false);

  const [conflictDialog, setConflictDialog] = useState(null);

  const _doAdd = (item, quantity, itemId) => {
    const maxQuantity = item.stock ?? item.quantity_available ?? 999;
    let result = { success: false, message: "" };

    setCartItems((prev) => {
      const existing = prev.find((i) => String(i.id) === itemId);
      if (existing) {
        const newQuantity = existing.quantity + quantity;
        if (newQuantity > maxQuantity) {
          result = {
            success: false,
            message: `❌ Only ${maxQuantity} available! You already have ${existing.quantity} in cart.`,
          };
          return prev;
        }
        result = { success: true, message: "✅ Added to Cart!" };
        return prev.map((i) =>
          String(i.id) === itemId ? { ...i, quantity: newQuantity } : i
        );
      }
      if (quantity > maxQuantity) {
        result = { success: false, message: `❌ Only ${maxQuantity} item(s) available!` };
        return prev;
      }
      result = { success: true, message: "✅ Added to Cart!" };
      return [...prev, { ...item, id: itemId, quantity }];
    });

    setCartVendorId(item.vendor_id ?? item.branch?.vendor_id ?? null);
    setCartBranchId(item.branch_id ?? item.branch?.id ?? null);
    setCartVendorName(
      item.vendor_name ?? item.location ?? item.branch?.vendor?.business_name ?? "Restaurant"
    );

    return result;
  };

  const addToCart = (item, quantity = 1, isLoggedIn = false, locationName = null) => {
    if (!isLoggedIn) {
      setShowSignInPopup(true);
      return { success: false, message: "Please sign in first" };
    }
    if (!locationName) {
      setShowLocationPopup(true);
      return { success: false, message: "Please set your location" };
    }

    const itemId = String(item.id);
    if (!itemId || itemId === "undefined") {
      return { success: false, message: "Error: Item ID missing" };
    }

    const incomingVendorId = item.vendor_id ?? item.branch?.vendor_id ?? null;
    const incomingBranchId = item.branch_id ?? item.branch?.id ?? null;
    const incomingVendorName =
      item.vendor_name ?? item.location ?? item.branch?.vendor?.business_name ?? "Restaurant";

    if (cartItems.length > 0) {
      const vendorMismatch = cartVendorId && incomingVendorId && String(cartVendorId) !== String(incomingVendorId);
      const branchMismatch = cartBranchId && incomingBranchId && String(cartBranchId) !== String(incomingBranchId);

      if (vendorMismatch || branchMismatch) {
        setConflictDialog({
          pendingItem: item,
          pendingQty: quantity,
          pendingItemId: itemId,
          currentVendor: cartVendorName,
          newVendor: incomingVendorName,
        });
        return { success: false, message: "conflict" };
      }
    }

    return _doAdd(item, quantity, itemId);
  };

  const handleConflictClear = () => {
    if (!conflictDialog) return;
    const { pendingItem, pendingQty, pendingItemId } = conflictDialog;
    setCartItems([]);
    setConflictDialog(null);
    _doAdd(pendingItem, pendingQty, pendingItemId);
  };

  const handleConflictCancel = () => setConflictDialog(null);

  const updateQuantity = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      if (next.length === 0) {
        setCartVendorId(null);
        setCartBranchId(null);
        setCartVendorName("");
      }
      return next;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartVendorId(null);
    setCartBranchId(null);
    setCartVendorName("");
  };

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

      {conflictDialog && (
        <ConflictDialog
          currentVendor={conflictDialog.currentVendor}
          newVendor={conflictDialog.newVendor}
          onClear={handleConflictClear}
          onCancel={handleConflictCancel}
        />
      )}

      {showSignInPopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowSignInPopup(false)}>
          <div style={{
            background: "white", borderRadius: "14px", padding: "2rem",
            maxWidth: "360px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🛒</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937" }}>Sign In Required</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              You need to sign in first to add items to your cart.
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button onClick={() => setShowSignInPopup(false)} style={{
                flex: 1, padding: "0.65rem", border: "1.5px solid #e5e7eb",
                borderRadius: "8px", background: "white", color: "#374151",
                fontWeight: 600, cursor: "pointer",
              }}>Cancel</button>
              <button onClick={() => { setShowSignInPopup(false); window.location.href = "/signin"; }} style={{
                flex: 1, padding: "0.65rem", border: "none",
                borderRadius: "8px", background: "#10b981", color: "white",
                fontWeight: 600, cursor: "pointer",
              }}>Sign In</button>
            </div>
          </div>
        </div>
      )}

      {showLocationPopup && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          zIndex: 99999, display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setShowLocationPopup(false)}>
          <div style={{
            background: "white", borderRadius: "14px", padding: "2rem",
            maxWidth: "360px", width: "90%", textAlign: "center",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>📍</div>
            <h3 style={{ margin: "0 0 0.5rem", color: "#1f2937" }}>Location Required</h3>
            <p style={{ color: "#6b7280", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              Please set your location first before adding items to your cart.
            </p>
            <button onClick={() => setShowLocationPopup(false)} style={{
              width: "100%", padding: "0.65rem", border: "none",
              borderRadius: "8px", background: "#10b981", color: "white",
              fontWeight: 600, cursor: "pointer",
            }}>OK</button>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);