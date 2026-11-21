import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export function AdminLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-canvas text-slate-900 font-sans flex">
      {/* Role-Aware Sidebar */}
      <AdminSidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area (Offset for desktop fixed sidebar) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <AdminHeader onOpenMobileMenu={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
