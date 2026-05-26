import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CartProvider } from "./Context/CartContext";
import { AuthProvider } from "./Context/AuthContext";
import { NotificationsProvider } from "./Context/Notificationscontext";
import { installApiFetch } from "./utils/api";
import "./index.css";
import "./i18n";

installApiFetch();

ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
    <CartProvider>
      <NotificationsProvider>
        <App />
      </NotificationsProvider>
    </CartProvider>
  </AuthProvider>,
);
