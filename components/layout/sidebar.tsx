'use client';

import React, { useState } from 'react';
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
  History,
  ClipboardList,
  ChevronDown,
  Store,
  Landmark,
  Shield,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../providers/auth-provider';
import { PERMISSIONS } from '../../lib/permissions';

type NavChild = {
  title: string;
  href: string;
  icon: LucideIcon;
  permission: string;
};

type NavItem = {
  title: string;
  href?: string;
  icon: LucideIcon;
  permission: string;
  children?: NavChild[];
};

const navSections: { title: string; icon?: LucideIcon; collapsible?: boolean; items: NavItem[] }[] = [
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
        title: 'Categories',
        href: '/categories',
        icon: Layers,
        permission: PERMISSIONS.CATEGORIES_VIEW,
      },
      {
        title: 'Products & Wood',
        href: '/products',
        icon: TreePine,
        permission: PERMISSIONS.PRODUCTS_VIEW,
      },
      {
        title: 'Inventory & Stock',
        icon: Boxes,
        permission: PERMISSIONS.INVENTORY_VIEW,
        children: [
          {
            title: 'Stock Management',
            href: '/inventory',
            icon: ClipboardList,
            permission: PERMISSIONS.INVENTORY_VIEW,
          },
          {
            title: 'Stock Ledger',
            href: '/inventory/ledger',
            icon: History,
            permission: PERMISSIONS.INVENTORY_VIEW,
          },
        ],
      },
    ],
  },
  {
    title: 'Commerce & CRM',
    icon: Store,
    collapsible: true,
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
        title: 'Customer Ledger',
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
    icon: Landmark,
    collapsible: true,
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
    icon: Shield,
    collapsible: true,
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

function sectionIsActive(pathname: string, items: NavItem[]) {
  return items.some((item) => {
    if (item.href && isHrefActive(pathname, item.href)) return true;
    return (item.children || []).some((child) => isHrefActive(pathname, child.href));
  });
}

function isHrefActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard';
  if (href === '/inventory') return pathname === '/inventory';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { hasPermission } = useAuth();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  return (
    <aside
      className={cn(
        'w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col h-screen select-none',
        className,
      )}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-800 gap-3">
        <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-md border border-slate-700/50 overflow-hidden">
          <img src="/logo.png" alt="Kuber Plywood Logo" className="h-full w-full object-contain" />
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

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-thin">
        {navSections.map((section, secIdx) => {
          const visibleItems = section.items.filter((item) => hasPermission(item.permission));
          if (visibleItems.length === 0) return null;
          const sectionActive = sectionIsActive(pathname, visibleItems);
          const expanded = section.collapsible ? (openMenus[section.title] ?? sectionActive) : true;
          const SectionIcon = section.icon;

          return (
            <div key={secIdx} className="space-y-1">
              {section.collapsible ? (
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenus((current) => ({
                      ...current,
                      [section.title]: !expanded,
                    }))
                  }
                  aria-expanded={expanded}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white',
                    sectionActive ? 'text-white' : 'text-slate-300',
                  )}
                >
                  {SectionIcon ? (
                    <SectionIcon
                      className={cn('h-4 w-4 shrink-0', sectionActive ? 'text-red-400' : 'text-slate-400')}
                    />
                  ) : null}
                  <span className="truncate flex-1 text-left">{section.title}</span>
                  <ChevronDown
                    className={cn(
                      'h-4 w-4 shrink-0 text-slate-400 transition-transform',
                      expanded && 'rotate-180',
                    )}
                  />
                </button>
              ) : (
                <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              {expanded ? visibleItems.map((item) => {
                const Icon = item.icon;
                const children = (item.children || []).filter((child) =>
                  hasPermission(child.permission),
                );

                if (children.length > 0) {
                  const groupActive = children.some((child) => isHrefActive(pathname, child.href));
                  const expanded = openMenus[item.title] ?? groupActive;
                  return (
                    <div key={item.title} className="space-y-1">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenus((current) => ({
                            ...current,
                            [item.title]: !expanded,
                          }))
                        }
                        aria-expanded={expanded}
                        className={cn(
                          'flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white',
                          groupActive ? 'text-white' : 'text-slate-300',
                        )}
                      >
                        <Icon
                          className={cn('h-4 w-4 shrink-0', groupActive ? 'text-red-400' : 'text-slate-400')}
                        />
                        <span className="truncate flex-1 text-left">{item.title}</span>
                        <ChevronDown
                          className={cn(
                            'h-4 w-4 shrink-0 text-slate-400 transition-transform',
                            expanded && 'rotate-180',
                          )}
                        />
                      </button>
                      {expanded ? (
                        <div className="ml-4 space-y-1 border-l border-slate-800 pl-2">
                          {children.map((child) => {
                            const ChildIcon = child.icon;
                            const childActive = isHrefActive(pathname, child.href);
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                prefetch
                                className={cn(
                                  'flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all duration-150',
                                  childActive
                                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800',
                                )}
                              >
                                <ChildIcon className={cn('h-3.5 w-3.5 shrink-0', childActive ? 'text-white' : 'text-slate-500')} />
                                <span className="truncate">{child.title}</span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                const isActive = item.href ? isHrefActive(pathname, item.href) : false;
                return (
                  <Link
                    key={item.href}
                    href={item.href || '#'}
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
              }) : null}
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
        <span>v1.0.0 Production</span>
        <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
      </div>
    </aside>
  );
}
