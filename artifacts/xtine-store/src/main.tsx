import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setBaseUrl } from '@workspace/api-client-react';
import { Router, Route, Switch } from 'wouter';

import App from './App';
import ProductPage from './ProductPage';
import OrderCompletePage from './OrderCompletePage';
import { API_BASE } from './stripe';
import { ErrorBoundary } from '@/components/error-boundary';

import './index.css';

const queryClient = new QueryClient();
setBaseUrl(API_BASE);

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <Router>
        <Switch>
          <Route path="/order-complete" component={OrderCompletePage} />
          {/* Product detail pages — /rust, /rainbow-six-siege, etc. */}
          <Route path="/:slug" component={ProductPage} />
          {/* Main storefront — root and anything that isn't a slug */}
          <Route component={App} />
        </Switch>
      </Router>
    </ErrorBoundary>
  </QueryClientProvider>,
);
