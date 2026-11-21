import React, { Suspense } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { PublicLayout } from '@/layouts/PublicLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { RequireAuth } from '@/components/shared/RequireAuth';
import { PageSkeleton } from '@/components/shared/LoadingSkeleton';

// Code-split Public Pages
const HomePage = React.lazy(() => import('@/pages/public/HomePage').then((m) => ({ default: m.HomePage })));
const GroupListPage = React.lazy(() => import('@/pages/public/GroupListPage').then((m) => ({ default: m.GroupListPage })));
const GroupDetailPage = React.lazy(() => import('@/pages/public/GroupDetailPage').then((m) => ({ default: m.GroupDetailPage })));
const ProductDetailPage = React.lazy(() => import('@/pages/public/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage })));
const PublicCheckoutPage = React.lazy(() => import('@/pages/public/PublicCheckoutPage').then((m) => ({ default: m.PublicCheckoutPage })));
const OrderSuccessPage = React.lazy(() => import('@/pages/public/OrderSuccessPage').then((m) => ({ default: m.OrderSuccessPage })));
const NotFoundPage = React.lazy(() => import('@/pages/public/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

// Code-split Auth & Admin Pages
const LoginPage = React.lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })));

// Master Admin Pages
const MasterDashboardPage = React.lazy(() => import('@/pages/master-admin/MasterDashboardPage').then((m) => ({ default: m.MasterDashboardPage })));
const GroupManagementPage = React.lazy(() => import('@/pages/master-admin/GroupManagementPage').then((m) => ({ default: m.GroupManagementPage })));
const AdminManagementPage = React.lazy(() => import('@/pages/master-admin/AdminManagementPage').then((m) => ({ default: m.AdminManagementPage })));
const AllOrdersPage = React.lazy(() => import('@/pages/master-admin/AllOrdersPage').then((m) => ({ default: m.AllOrdersPage })));
const ActivityLogsPage = React.lazy(() => import('@/pages/master-admin/ActivityLogsPage').then((m) => ({ default: m.ActivityLogsPage })));

// Group Admin Pages
const GroupDashboardPage = React.lazy(() => import('@/pages/group-admin/GroupDashboardPage').then((m) => ({ default: m.GroupDashboardPage })));
const GroupProductsPage = React.lazy(() => import('@/pages/group-admin/GroupProductsPage').then((m) => ({ default: m.GroupProductsPage })));
const GroupOrdersPage = React.lazy(() => import('@/pages/group-admin/GroupOrdersPage').then((m) => ({ default: m.GroupOrdersPage })));

// TanStack Query Client
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
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              {/* Public Storefront Routes */}
              <Route element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="groups" element={<GroupListPage />} />
                <Route path="groups/:idOrSlug" element={<GroupDetailPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="checkout/:productId" element={<PublicCheckoutPage />} />
                <Route path="order/success/:orderCode" element={<OrderSuccessPage />} />
              </Route>

              {/* Authentication Routes */}
              <Route path="login" element={<LoginPage />} />

              {/* Master Admin Protected Routes */}
              <Route
                path="admin"
                element={
                  <RequireAuth role="master_admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<MasterDashboardPage />} />
                <Route path="groups" element={<GroupManagementPage />} />
                <Route path="admins" element={<AdminManagementPage />} />
                <Route path="orders" element={<AllOrdersPage />} />
                <Route path="logs" element={<ActivityLogsPage />} />
              </Route>

              {/* Group Admin Protected Routes */}
              <Route
                path="dashboard"
                element={
                  <RequireAuth role="group_admin">
                    <AdminLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<GroupDashboardPage />} />
                <Route path="products" element={<GroupProductsPage />} />
                <Route path="orders" element={<GroupOrdersPage />} />
              </Route>

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
