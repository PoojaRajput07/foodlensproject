// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'var(--ls-surface)',
                color: 'var(--ls-text)',
                border: '1px solid var(--ls-border)',
                borderRadius: '10px',
                fontSize: '14px',
                boxShadow: 'var(--shadow-md)',
              },
              success: {
                iconTheme: { primary: '#1F7A4D', secondary: '#fff' },
              },
              error: {
                iconTheme: { primary: '#C0392B', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
