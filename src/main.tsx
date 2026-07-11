import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { QueryProvider } from './lib/react-query/QueryProvider';

// PWA service worker — production only so dev never serves stale modules
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <QueryProvider>
      <ThemeProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryProvider>
  </BrowserRouter>
);
