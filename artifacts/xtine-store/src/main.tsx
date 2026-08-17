import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App';
import ProductPage from './ProductPage';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        {/* Product detail pages — e.g. /rust, /rainbow-six-siege */}
        <Route path="/:slug" element={<ProductPage />} />
        {/* Main storefront — catches / and anything that isn't a product slug */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </ErrorBoundary>,
);
