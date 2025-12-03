import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import i18n from "./i18n";
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from "./components/context/CartContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <BrowserRouter>
        <CartProvider>
          <App />
        </CartProvider>
      </BrowserRouter>
    </I18nextProvider>
  </React.StrictMode>
);