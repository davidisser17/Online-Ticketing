import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

async function enableMocking() {
  // Aktif di DEV, atau di PROD jika VITE_ENABLE_MOCK=true (untuk demo/GitHub Pages)
  const shouldMock =
    import.meta.env.DEV || import.meta.env.VITE_ENABLE_MOCK === 'true';

  if (shouldMock) {
    const { worker } = await import('./mocks/browser');
    return worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        // Pastikan path service worker sesuai base URL GitHub Pages
        url: import.meta.env.BASE_URL + 'mockServiceWorker.js',
      },
    });
  }
}

enableMocking().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
});
