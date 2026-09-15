'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../providers/auth-provider';
import { Sidebar } from '../../components/layout/sidebar';
import { Topbar } from '../../components/layout/topbar';
import { MobileNav } from '../../components/layout/mobile-nav';
import { ContentArea } from '../../components/layout/content-area';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (!user) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-slate-200 dark:border-slate-800 animate-bounce">
              <img src="/logo.png" alt="Kuber Plywood" className="h-full w-full object-contain" />
            </div>
            <p className="text-xs font-semibold text-slate-500 animate-pulse tracking-wide">
              Loading Kuber Plywood ERP...
            </p>
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      <MobileNav
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuToggle={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <ContentArea>{children}</ContentArea>
          </div>
        </main>
      </div>
    </div>
  );
}
