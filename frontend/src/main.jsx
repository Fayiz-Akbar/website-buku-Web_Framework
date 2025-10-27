import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; 
import './index.css';

import { AuthProvider } from './Context/AuthContext';
// --- IMPORT BARU ---
import { WishlistProvider } from './Context/WishlistContext'; 
import { CartProvider } from './Context/CartContext.jsx';
import { ToastProvider } from './components/Toast/ToastProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthProvider> 
        {/* --- Bungkus dengan WishlistProvider --- */}
        <WishlistProvider> 
          <CartProvider>
            <ToastProvider>
              <App />
            </ToastProvider>
          </CartProvider>
        </WishlistProvider>
        {/* --- Batas --- */}
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);