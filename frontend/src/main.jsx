import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App'; 
import './index.css';

import { AuthProvider } from './Context/AuthContext';
// --- IMPORT BARU ---
import { WishlistProvider } from './Context/WishlistContext'; 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthProvider> 
        {/* --- Bungkus dengan WishlistProvider --- */}
        <WishlistProvider> 
            <App />
        </WishlistProvider>
        {/* --- Batas --- */}
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);