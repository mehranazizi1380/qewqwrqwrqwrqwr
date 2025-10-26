
import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { tonWalletService } from './services/tonService';
import { referralService } from './services/referralService';

// Initialize services
tonWalletService.loadFromStorage();
referralService.loadFromStorage();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
