'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  TrendingUp,
  DollarSign,
  Boxes,
  Users,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  ShoppingBag,
  ArrowUpRight,
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
import { formatCurrency, formatDate } from '../../../lib/utils';

export default function DashboardPage() {
  const { data: summaryRes, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => reportService.getDashboardSummary(),
  });

  const summary = summaryRes?.data;
  const kpi = summary?.kpi;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kuber Plywood - Executive Overview"
        description="Real-time operational health, timber inventory valuation, and sales metrics."
      />

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
          subtitle="Items Below Threshold"
          className={kpi?.lowStockCount ? 'border-amber-400 dark:border-amber-700' : ''}
        />
        <StatCard
          title="Active Customers"
          value={kpi?.totalCustomers ?? 0}
          icon={<Users className="h-5 w-5" />}
          subtitle="Registered Timber Buyers"
        />
      </div>

      {/* Sales Trend Chart & Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Area Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Sales Revenue Trajectory</span>
              <Badge variant="outline">Last 14 Days</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full pt-4">
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
                      tickFormatter={(val) => `₹${val / 1000}k`}
                    />
                    <Tooltip
                      formatter={(val: any) => [formatCurrency(val), 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
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
          </CardContent>
        </Card>

        {/* Low Stock Attention List */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Low Stock Timber</span>
              <Badge variant="destructive">Needs Restock</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 pt-2">
              {summary?.lowStockItems && summary.lowStockItems.length > 0 ? (
                summary.lowStockItems.map((item) => (
                  <div
                    key={item._id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        SKU: {item.sku} • {item.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-rose-600">
                        {item.currentStock} {item.unit}
                      </span>
                      <p className="text-[10px] text-slate-400">Min: {item.minimumStock}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-emerald-600 font-medium">
                  ✅ All inventory stock levels are healthy!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales & Purchases Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Sales Invoices</CardTitle>
            <a href="/sales" className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center font-medium">
              View All <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </a>
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

        {/* Recent Purchases */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Purchase Orders</CardTitle>
            <a href="/purchases" className="text-xs text-red-600 hover:text-red-700 hover:underline flex items-center font-medium">
              View All <ArrowUpRight className="h-3 w-3 ml-0.5" />
            </a>
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
    </div>
  );
}
