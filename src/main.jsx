// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';

// 1) IMPORT CORRECTO:
import AuthProvider from 'react-auth-kit';
import createStore from 'react-auth-kit/createStore';

// 2) CREA TU STORE:
const store = createStore({
  authName: '_auth',           // clave en localStorage ó cookie
  authType: 'localstorage',    // o 'cookie'
  // cookieDomain: window.location.hostname,
  // cookieSecure: false,
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 3) PÁSALO COMO PROP */}
    <AuthProvider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
