import { createRoot } from 'react-dom/client';
import { Router, Route, Switch } from 'wouter';

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
    <Router>
      <Switch>
        {/* Product detail pages — /rust, /rainbow-six-siege, etc. */}
        <Route path="/:slug" component={ProductPage} />
        {/* Main storefront — root and anything that isn't a slug */}
        <Route component={App} />
      </Switch>
    </Router>
  </ErrorBoundary>,
);
