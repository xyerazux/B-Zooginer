import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Megaphone } from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export function PublicLayout() {
  const { data: settings } = useSiteSettings();

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-slate-900 font-sans">
      {/* Announcement Bar */}
      {settings?.is_announcement_active && settings?.announcement_text && (
        <aside
          aria-label="Pengumuman Acara"
          className="bg-primary-950 text-slate-200 text-xs py-2 px-4 border-b border-primary-900"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-center font-medium">
            <Megaphone size={13} className="text-accent-400 shrink-0" />
            <span>{settings.announcement_text}</span>
          </div>
        </aside>
      )}

      {/* Main Navigation */}
      <Navbar />

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Notifications */}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
