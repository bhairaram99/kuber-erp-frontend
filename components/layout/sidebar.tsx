'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TreePine,
  Layers,
  Boxes,
  Users,
  Truck,
  ShoppingCart,
  ShoppingBag,
  ArrowLeftRight,
  CreditCard,
  Receipt,
  BarChart3,
  UserCheck,
  ShieldCheck,
  ScrollText,
  Settings,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../providers/auth-provider';
import { PERMISSIONS } from '../../lib/permissions';

const navSections = [
  {
    title: 'Core Business',
    items: [
      {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        permission: PERMISSIONS.DASHBOARD_VIEW,
      },
      {
        title: 'Products & Wood',
        href: '/products',
        icon: TreePine,
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        title: 'Categories',
        href: '/categories',
        icon: Layers,
        permission: PERMISSIONS.CATEGORIES_VIEW,
      },
      {
        title: 'Inventory & Stock',
        href: '/inventory',
        icon: Boxes,
        permission: PERMISSIONS.INVENTORY_VIEW,
      },
    ],
  },
  {
    title: 'Commerce & CRM',
    items: [
      {
        title: 'Sales & Invoices',
        href: '/sales',
        icon: ShoppingCart,
        permission: PERMISSIONS.SALES_VIEW,
      },
      {
        title: 'Purchases / PO',
        href: '/purchases',
        icon: ShoppingBag,
        permission: PERMISSIONS.PURCHASES_VIEW,
      },
      {
        title: 'Customers',
        href: '/customers',
        icon: Users,
        permission: PERMISSIONS.CUSTOMERS_VIEW,
      },
      {
        title: 'Suppliers',
        href: '/suppliers',
        icon: Truck,
        permission: PERMISSIONS.SUPPLIERS_VIEW,
      },
    ],
  },
  {
    title: 'Finance & Ledger',
    items: [
      {
        title: 'Central Transactions',
        href: '/transactions',
        icon: ArrowLeftRight,
        permission: PERMISSIONS.TRANSACTIONS_VIEW,
      },
      {
        title: 'Payments',
        href: '/payments',
        icon: CreditCard,
        permission: PERMISSIONS.PAYMENTS_VIEW,
      },
      {
        title: 'Expenses',
        href: '/expenses',
        icon: Receipt,
        permission: PERMISSIONS.EXPENSES_VIEW,
      },
      {
        title: 'Reports & P&L',
        href: '/reports',
        icon: BarChart3,
        permission: PERMISSIONS.REPORTS_VIEW,
      },
    ],
  },
  {
    title: 'Administration',
    items: [
      {
        title: 'Users',
        href: '/users',
        icon: UserCheck,
        permission: PERMISSIONS.USERS_VIEW,
      },
      {
        title: 'Roles & Access',
        href: '/roles',
        icon: ShieldCheck,
        permission: PERMISSIONS.ROLES_VIEW,
      },
      {
        title: 'Audit Logs',
        href: '/audit-logs',
        icon: ScrollText,
        permission: PERMISSIONS.AUDIT_VIEW,
      },
      {
        title: 'Business Settings',
        href: '/settings',
        icon: Settings,
        permission: PERMISSIONS.SETTINGS_VIEW,
      },
    ],
  },
];

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();

  return (
    <aside
      className={cn(
        'w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col h-screen select-none',
        className,
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3">
        <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-slate-700/50 overflow-hidden">
          <img
            src="/logo.png"
            alt="Kuber Plywood Logo"
            className="h-full w-full object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-extrabold text-sm tracking-tight text-white leading-tight truncate">
            KUBER PLYWOOD
          </h2>
          <span className="text-[10px] text-red-500 font-bold tracking-wider uppercase block">
            Timber & Plywood ERP
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin">
        {navSections.map((section, secIdx) => {
          const visibleItems = section.items.filter((item) =>
            hasPermission(item.permission),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={secIdx} className="space-y-1">
              <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    prefetch
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                      isActive
                        ? 'bg-red-600 text-white shadow-sm font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800',
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-white' : 'text-slate-400')} />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>v1.0.0 Production</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
}
