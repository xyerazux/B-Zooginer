import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PublicLayout } from '@/layouts/PublicLayout';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

// Code-split page routes using React.lazy
const HomePage = React.lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const GroupListPage = React.lazy(() => import('@/pages/public/GroupListPage').then((m) => ({ default: m.GroupListPage })));
const GroupDetailPage = React.lazy(() => import('@/pages/public/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage })));
const ProductDetailPage = React.lazy(() => import('@/pages/public/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const PublicCheckoutPage = React.lazy(() => import('@/pages/public/PublicCheckoutPage').then((m) => ({ default: m.PublicCheckoutPage })));
const OrderSuccessPage = React.lazy(() => import('@/pages/public/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })));
const NotFoundPage = React.lazy(() => import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Configure TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 3, // 3 minutes
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            {/* Public Storefront Routes with PublicLayout */}
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="groups" element={<GroupListPage />} />
              <Route path="groups/:idOrSlug" element={<GroupDetailPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="checkout/:productId" element={<PublicCheckoutPage />} />
              <Route path="order/success/:orderCode" element={<OrderSuccessPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
