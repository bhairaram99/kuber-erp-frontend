'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { reportService } from '../../../services/report.service';
import { PageHeader } from '../../../components/common/page-header';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { formatCurrency } from '../../../lib/utils';
import { ProfitAndLossReport } from '../../../types';

export default function ReportsPage() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activeTab, setActiveTab] = useState<'pnl' | 'sales' | 'inventory'>('pnl');

  const { data: pnlData, isLoading: pnlLoading } = useQuery({
    queryKey: ['report-pnl', from, to],
    queryFn: () => reportService.getProfitAndLoss({ from: from || undefined, to: to || undefined }),
  });

  const { data: salesReportData, isLoading: salesLoading } = useQuery({
    queryKey: ['report-sales', from, to],
    queryFn: () => reportService.getSalesReport({ from: from || undefined, to: to || undefined }),
    enabled: activeTab === 'sales',
  });

  const { data: invReportData, isLoading: invLoading } = useQuery({
    queryKey: ['report-inv'],
    queryFn: () => reportService.getInventoryReport(),
    enabled: activeTab === 'inventory',
  });

  const pnl: ProfitAndLossReport = (pnlData as any)?.data || {
    revenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyTrend: [],
  };

  const salesReport = (salesReportData as any)?.data;
  const invReport = (invReportData as any)?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial & Inventory Reports"
        description="Authoritative Profit & Loss analysis, product sales volume, and valuation."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Reports' },
        ]}
      />

      {/* Control / Date Range Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Tab switcher */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pnl')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'pnl'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Profit & Loss
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'sales'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sales Analytics
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'inventory'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Stock Health
          </button>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 text-xs">
          <Calendar className="h-4 w-4 text-slate-400" />
          <Input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="h-8 text-xs w-36"
          />
          <span className="text-slate-400">to</span>
          <Input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="h-8 text-xs w-36"
          />
          {(from || to) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
              className="h-8 text-xs text-rose-500"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {activeTab === 'pnl' && (
        <div className="space-y-6">
          {/* Executive P&L Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5 border-l-4 border-l-red-600 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(pnl.revenue)}
              </p>
              <span className="text-[11px] text-slate-400">Gross sales invoices</span>
            </Card>

            <Card className="p-5 border-l-4 border-l-slate-400 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cost of Goods Sold (COGS)
              </span>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
                {formatCurrency(pnl.costOfGoodsSold)}
              </p>
              <span className="text-[11px] text-slate-400">Direct material cost</span>
            </Card>

            <Card className="p-5 border-l-4 border-l-emerald-600 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Gross Profit
              </span>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(pnl.grossProfit)}
              </p>
              <span className="text-[11px] text-emerald-600 font-medium">
                Margin: {pnl.revenue > 0 ? ((pnl.grossProfit / pnl.revenue) * 100).toFixed(1) : 0}%
              </span>
            </Card>

            <Card className="p-5 border-l-4 border-l-blue-600 space-y-1">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Net Profit
              </span>
              <p
                className={`text-2xl font-bold ${
                  pnl.netProfit >= 0
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-rose-600'
                }`}
              >
                {formatCurrency(pnl.netProfit)}
              </p>
              <span className="text-[11px] text-slate-400">
                After ₹{pnl.operatingExpenses?.toLocaleString() || 0} expenses
              </span>
            </Card>
          </div>

          {/* Statement Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-6 space-y-4 lg:col-span-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
                Income Statement Summary
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    (+) Gross Revenue
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(pnl.revenue)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-rose-600 font-medium">
                    (-) Cost of Goods Sold
                  </span>
                  <span className="font-bold text-rose-600">
                    -{formatCurrency(pnl.costOfGoodsSold)}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 bg-emerald-50 dark:bg-emerald-950/30 px-2 rounded-lg font-bold text-emerald-800 dark:text-emerald-300">
                  <span>(=) Gross Profit</span>
                  <span>{formatCurrency(pnl.grossProfit)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-rose-600 font-medium">
                    (-) Operational Expenses
                  </span>
                  <span className="font-bold text-rose-600">
                    -{formatCurrency(pnl.operatingExpenses)}
                  </span>
                </div>
                <div className="flex justify-between py-2 bg-blue-50 dark:bg-blue-950/30 px-2 rounded-lg font-extrabold text-sm text-blue-900 dark:text-blue-300">
                  <span>(=) Net Operating Profit</span>
                  <span>{formatCurrency(pnl.netProfit)}</span>
                </div>
              </div>
            </Card>

            {/* Monthly Trend Chart */}
            <Card className="p-6 space-y-4 lg:col-span-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
                Revenue vs COGS vs Gross Profit (Monthly Trajectory)
              </h3>
              <div className="h-64">
                {pnl.monthlyTrend && pnl.monthlyTrend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pnl.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(val: any) => formatCurrency(Number(val))}
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      <Bar dataKey="revenue" fill="#d97706" name="Revenue" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="cogs" fill="#64748b" name="COGS" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="grossProfit" fill="#10b981" name="Gross Profit" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No monthly data available for the selected period.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'sales' && (
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
            Top Performing Wood Products
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="p-3">Product / Timber</th>
                  <th className="p-3 text-right">Units Sold</th>
                  <th className="p-3 text-right">Revenue Generated</th>
                  <th className="p-3 text-right">COGS</th>
                  <th className="p-3 text-right">Gross Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {salesReport?.productPerformance?.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">
                      {p.name}
                    </td>
                    <td className="p-3 text-right">{p.quantity}</td>
                    <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(p.revenue)}
                    </td>
                    <td className="p-3 text-right text-slate-500">
                      {formatCurrency(p.cogs)}
                    </td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      {formatCurrency(p.grossProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="p-6 space-y-2 border-l-4 border-l-red-600">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Stock Valuation
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {formatCurrency(invReport?.totalValuation || 0)}
            </p>
            <span className="text-[11px] text-slate-400">
              Based on purchase price snapshot
            </span>
          </Card>
          <Card className="p-6 space-y-2 border-l-4 border-l-emerald-600">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Wood Units
            </span>
            <p className="text-2xl font-bold text-emerald-600">
              {invReport?.totalUnits?.toLocaleString() || 0}
            </p>
            <span className="text-[11px] text-slate-400">
              Across CFT, SQFT, and pieces
            </span>
          </Card>
          <Card className="p-6 space-y-2 border-l-4 border-l-rose-600">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Low Stock Warnings
            </span>
            <p className="text-2xl font-bold text-rose-600">
              {invReport?.lowStockCount || 0}
            </p>
            <span className="text-[11px] text-slate-400">
              Below threshold reorder level
            </span>
          </Card>
        </div>
      )}
    </div>
  );
}
