import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; 
import './index.css';

import { AuthProvider } from './Context/AuthContext';
// --- IMPORT BARU ---
import { WishlistProvider } from './Context/WishlistContext'; 
import { CartProvider } from './Context/CartContext.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> 
      <AuthProvider> 
        {/* --- Bungkus dengan WishlistProvider --- */}
        <WishlistProvider> 
          <CartProvider>
            <App />
          </CartProvider>
        </WishlistProvider>
        {/* --- Batas --- */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);