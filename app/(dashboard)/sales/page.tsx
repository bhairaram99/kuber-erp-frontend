'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Plus, Eye, Search, Filter } from 'lucide-react';
import { salesService } from '../../../services/sales.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Sale } from '../../../types';

export default function SalesPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [status, setStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sales', page, limit, search, paymentStatus, status],
    queryFn: () =>
      salesService.findPaginated({
        page,
        limit,
        search,
        paymentStatus: paymentStatus || undefined,
        status: status || undefined,
      }),
  });

  const columns = [
    {
      header: 'Invoice #',
      accessorKey: 'invoiceNumber',
      cell: (row: Sale) => (
        <span className="font-semibold text-red-600 dark:text-red-400 hover:underline">
          {row.invoiceNumber}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'saleDate',
      cell: (row: Sale) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.saleDate)}
        </span>
      ),
    },
    {
      header: 'Customer',
      accessorKey: 'customerId',
      cell: (row: Sale) => {
        const cust = row.customerId as any;
        return (
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {cust?.name || 'Walk-in Customer'}
            </p>
            {cust?.company && (
              <p className="text-[11px] text-slate-400">{cust.company}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Items',
      accessorKey: 'items',
      cell: (row: Sale) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
          {row.items?.length || 0} items
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessorKey: 'total',
      cell: (row: Sale) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      header: 'Paid / Due',
      accessorKey: 'paidAmount',
      cell: (row: Sale) => (
        <div className="text-xs">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            {formatCurrency(row.paidAmount)}
          </span>
          {row.dueAmount > 0 && (
            <span className="text-rose-500 font-medium block">
              Due: {formatCurrency(row.dueAmount)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Payment Status',
      accessorKey: 'paymentStatus',
      cell: (row: Sale) => (
        <Badge
          variant={
            row.paymentStatus === 'PAID'
              ? 'success'
              : row.paymentStatus === 'PARTIAL'
              ? 'warning'
              : 'destructive'
          }
        >
          {row.paymentStatus}
        </Badge>
      ),
    },
    {
      header: 'Order Status',
      accessorKey: 'status',
      cell: (row: Sale) => (
        <Badge
          variant={row.status === 'CONFIRMED' ? 'default' : 'destructive'}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: Sale) => (
        <Link href={`/sales/${row._id}`}>
          <Button variant="ghost" size="sm" className="h-8 gap-1">
            <Eye className="h-3.5 w-3.5" /> View
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales & Invoices"
        description="Create invoices, record payments, and track customer timber orders."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales' },
        ]}
        action={
          hasPermission(PERMISSIONS.SALES_CREATE) ? (
            <Link href="/sales/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Sale / POS
              </Button>
            </Link>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search invoice number or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by payment status"
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
          >
            <option value="">All Payment Statuses</option>
            <option value="PAID">PAID</option>
            <option value="PARTIAL">PARTIAL</option>
            <option value="DUE">DUE</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            aria-label="Filter by order status"
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
          >
            <option value="">All Order Statuses</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={(lim) => {
          setLimit(lim);
          setPage(1);
        }}
        emptyMessage="No sales invoices found."
      />
    </div>
  );
}
