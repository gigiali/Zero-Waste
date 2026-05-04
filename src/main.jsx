import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import { NotificationsProvider } from "./Context/Notificationscontext";
import { FavoritesProvider } from "./Context/FavoritesContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <CartProvider>
        <NotificationsProvider>
          <FavoritesProvider>
            <App />
          </FavoritesProvider>
        </NotificationsProvider>
      </CartProvider>
    </AuthProvider>
  </React.StrictMode>
);
