import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '../providers/query-provider';
import { AuthProvider } from '../providers/auth-provider';
import { ToastProvider } from '../providers/toast-provider';

export const metadata: Metadata = {
  title: 'Kuber Plywood ERP - Timber & Plywood Business Monolith',
  description:
    'Full-stack enterprise management system for Kuber Plywood: inventory, lumber volume, sales billing, procurement, and financial accounting.',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased">
        <QueryProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
