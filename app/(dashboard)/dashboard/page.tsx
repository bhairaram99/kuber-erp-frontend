'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  Users,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  ArrowUpRight,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { reportService } from '../../../services/report.service';
import { PageHeader } from '../../../components/common/page-header';
import { StatCard } from '../../../components/common/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { DashboardSummary } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';

const TREND_PERIODS = [
  { label: '7 Days', days: 7 },
  { label: '14 Days', days: 14 },
  { label: '1 Month', days: 30 },
  { label: '3 Months', days: 90 },
] as const;

type LowStockItem = DashboardSummary['lowStockItems'][number];

function sheetSpec(item: LowStockItem): string {
  const size = [item.thickness, item.width, item.length].filter((value) => Number(value) > 0);
  return size.length ? `${size.join('×')} mm` : '';
}

function productTypeLabel(item: LowStockItem): string {
  const category =
    item.categoryId && typeof item.categoryId === 'object' ? item.categoryId.name : '';
  return [item.woodType, item.grade, category, sheetSpec(item)].filter(Boolean).join(' • ');
}

export default function DashboardPage() {
  const [trendDays, setTrendDays] = useState<(typeof TREND_PERIODS)[number]['days']>(14);
  const [lowStockOpen, setLowStockOpen] = useState(false);
  const [outstandingOpen, setOutstandingOpen] = useState(false);

  const { data: summaryRes, isFetching } = useQuery({
    queryKey: ['dashboard-summary', trendDays],
    queryFn: () => reportService.getDashboardSummary(trendDays),
    placeholderData: (previous) => previous,
  });

  const summary = summaryRes?.data;
  const kpi = summary?.kpi;
  const lowStockItems = summary?.lowStockItems || [];
  const outstandingAccounts = summary?.outstandingAccounts || [];
  const selectedPeriod = TREND_PERIODS.find((period) => period.days === trendDays);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuber Plywood - Executive Overview"
        description="Real-time operational health, timber inventory valuation, and sales metrics."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Outstanding Balance"
          value={formatCurrency(kpi?.customerOutstanding)}
          icon={<Wallet className="h-5 w-5" />}
          subtitle="Due from shopkeepers & customers"
          tone="danger"
          onClick={() => setOutstandingOpen(true)}
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(kpi?.totalSales)}
          icon={<ShoppingCart className="h-5 w-5" />}
          change="Real-time Revenue"
          isPositive={true}
        />
        <StatCard
          title="Gross Profit"
          value={formatCurrency(kpi?.grossProfit)}
          icon={<DollarSign className="h-5 w-5" />}
          change="Revenue - Wood COGS"
          isPositive={true}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(kpi?.netProfit)}
          icon={<TrendingUp className="h-5 w-5" />}
          change="After Operating Expenses"
          isPositive={(kpi?.netProfit ?? 0) >= 0}
        />
        <StatCard
          title="Operating Expenses"
          value={formatCurrency(kpi?.totalExpenses)}
          icon={<Receipt className="h-5 w-5" />}
          subtitle="Rent, Sawmill, Labor"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Inventory Valuation"
          value={formatCurrency(kpi?.currentStockValue)}
          icon={<Boxes className="h-5 w-5" />}
          subtitle="At Cost Basis"
        />
        <StatCard
          title="Low Stock Alerts"
          value={kpi?.lowStockCount ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          subtitle={kpi?.lowStockCount ? 'Click to see sheets & types' : 'Items Below Threshold'}
          className={kpi?.lowStockCount ? 'border-amber-400 dark:border-amber-700' : ''}
          onClick={() => setLowStockOpen(true)}
        />
        <StatCard
          title="Active Customers"
          value={kpi?.totalCustomers ?? 0}
          icon={<Users className="h-5 w-5" />}
          subtitle="Registered Timber Buyers"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span>Sales Revenue Trajectory</span>
              <div className="flex flex-wrap gap-1.5">
                {TREND_PERIODS.map((period) => (
                  <button
                    key={period.days}
                    type="button"
                    onClick={() => setTrendDays(period.days)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                      trendDays === period.days
                        ? 'border-red-600 bg-red-600 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`h-72 w-full pt-4 ${isFetching ? 'opacity-60' : ''}`}>
              {summary?.salesTrend && summary.salesTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.salesTrend}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11f2b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#e11f2b" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="_id" tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis
                      tickLine={false}
                      tick={{ fontSize: 11 }}
                      tickFormatter={(val) =>
                        val >= 1000 ? `₹${(val / 1000).toFixed(val >= 10000 ? 0 : 1)}k` : `₹${val}`
                      }
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                      labelFormatter={(label) =>
                        trendDays > 31 ? `Week of ${label}` : `Date: ${label}`
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#e11f2b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No sales recorded in the selected period.
                </div>
              )}
            </div>
            <p className="pt-2 text-[11px] text-slate-400">
              Showing {selectedPeriod?.label.toLowerCase()}
              {trendDays > 31 ? ' (weekly totals).' : '.'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <button
                type="button"
                onClick={() => setLowStockOpen(true)}
                className="hover:text-red-600 transition"
              >
                Low Stock Timber
              </button>
              <Badge variant="destructive">Needs Restock</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.slice(0, 5).map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => setLowStockOpen(true)}
                    className="w-full text-left p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between hover:border-amber-300 transition"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {productTypeLabel(item) || `SKU: ${item.sku}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-extrabold text-rose-600">
                        {item.currentStock} {item.unit}
                      </span>
                      <p className="text-[10px] text-slate-400">Min: {item.minimumStock}</p>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-emerald-600 font-medium">
                  ✅ All inventory stock levels are healthy!
                </div>
              )}
              {lowStockItems.length > 5 && (
                <button
                  type="button"
                  onClick={() => setLowStockOpen(true)}
                  className="w-full text-center text-xs font-medium text-red-600 hover:underline"
                >
                  View all {lowStockItems.length} low-stock items
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Sales Invoices</CardTitle>
            <Link href="/sales" className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center font-medium">
              View All <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary?.recentSales && summary.recentSales.length > 0 ? (
                summary.recentSales.map((sale) => (
                  <div key={sale._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {sale.invoiceNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(sale.customerId as any)?.name || 'Walk-in Customer'} •{' '}
                        {formatDate(sale.saleDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(sale.total)}
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant={
                            sale.paymentStatus === 'PAID'
                              ? 'success'
                              : sale.paymentStatus === 'PARTIAL'
                              ? 'warning'
                              : 'destructive'
                          }
                          className="text-[9px] px-1.5 py-0"
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No recent sales</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
            <Link href="/purchases" className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center font-medium">
              View All <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {summary?.recentPurchases && summary.recentPurchases.length > 0 ? (
                summary.recentPurchases.map((po) => (
                  <div key={po._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {po.purchaseNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {(po.supplierId as any)?.name || 'Supplier'} • {formatDate(po.purchaseDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(po.total)}
                      </span>
                      <div className="mt-0.5">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {po.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">No recent purchases</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog
        isOpen={outstandingOpen}
        onClose={() => setOutstandingOpen(false)}
        title="Outstanding Balance"
        description="Money still due from shopkeepers and customers."
        maxWidth="2xl"
      >
        {outstandingAccounts.length > 0 ? (
          <div className="space-y-3">
            <div className="rounded-lg bg-red-600 px-4 py-3 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-red-100">Total due</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(kpi?.customerOutstanding)}</p>
            </div>
            {outstandingAccounts.map((account) => (
              <Link
                key={account._id}
                href={`/customers/${account._id}`}
                onClick={() => setOutstandingOpen(false)}
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-3 transition hover:border-red-400 hover:bg-red-50/50 dark:border-slate-800 dark:hover:bg-red-950/20"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{account.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[account.company, account.customerType, account.phone].filter(Boolean).join(' • ') ||
                      'Customer'}
                  </p>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-red-600">{formatCurrency(account.totalDue)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm font-medium text-emerald-600">
            No outstanding balance from shopkeepers or customers.
          </p>
        )}
      </Dialog>

      <Dialog
        isOpen={lowStockOpen}
        onClose={() => setLowStockOpen(false)}
        title="Low Stock Sheets & Types"
        description="Products at or below the minimum stock level, with wood type and sheet size."
        maxWidth="2xl"
      >
        {lowStockItems.length > 0 ? (
          <div className="space-y-3">
            {lowStockItems.map((item) => (
              <Link
                key={item._id}
                href={`/products/${item._id}`}
                onClick={() => setLowStockOpen(false)}
                className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 dark:border-slate-800 p-3 hover:border-amber-400 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {productTypeLabel(item) || 'Type not specified'}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    SKU: {item.sku} {item.location ? `• ${item.location}` : ''}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-extrabold text-rose-600">
                    {item.currentStock} {item.unit}
                  </p>
                  <p className="text-[11px] text-slate-400">Min: {item.minimumStock}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="py-6 text-center text-sm text-emerald-600 font-medium">
            All inventory stock levels are healthy.
          </p>
        )}
      </Dialog>
    </div>
  );
}
