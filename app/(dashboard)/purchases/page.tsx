'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShoppingBag, Plus, Eye, Search } from 'lucide-react';
import { purchaseService } from '../../../services/purchase.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Purchase } from '../../../types';

export default function PurchasesPage() {
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['purchases', page, limit, search, paymentStatus],
    queryFn: () =>
      purchaseService.findPaginated({
        page,
        limit,
        search,
        paymentStatus: paymentStatus || undefined,
      }),
  });

  const columns = [
    {
      header: 'PO #',
      accessorKey: 'purchaseNumber',
      cell: (row: Purchase) => (
        <span className="font-semibold text-red-600 dark:text-red-400 hover:underline">
          {row.purchaseNumber}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'purchaseDate',
      cell: (row: Purchase) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.purchaseDate)}
        </span>
      ),
    },
    {
      header: 'Supplier',
      accessorKey: 'supplierId',
      cell: (row: Purchase) => {
        const supp = row.supplierId as any;
        return (
          <div>
            <p className="font-medium text-slate-900 dark:text-slate-100">
              {supp?.name || 'Unknown Supplier'}
            </p>
            {supp?.company && (
              <p className="text-[11px] text-slate-400">{supp.company}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Items',
      accessorKey: 'items',
      cell: (row: Purchase) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800">
          {row.items?.length || 0} items
        </span>
      ),
    },
    {
      header: 'Total Value',
      accessorKey: 'total',
      cell: (row: Purchase) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      header: 'Paid / Due',
      accessorKey: 'paidAmount',
      cell: (row: Purchase) => (
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
      cell: (row: Purchase) => (
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
      header: 'Status',
      accessorKey: 'status',
      cell: (row: Purchase) => (
        <Badge variant={row.status === 'CONFIRMED' ? 'default' : 'destructive'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: Purchase) => (
        <Link href={`/purchases/${row._id}`}>
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
        title="Purchases & Procurement"
        description="Receive incoming timber shipments, track supplier payables, and record stock inflow."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchases' },
        ]}
        action={
          hasPermission(PERMISSIONS.PURCHASES_CREATE) ? (
            <Link href="/purchases/new">
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> New Purchase Order
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
            placeholder="Search PO number or notes..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
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
        emptyMessage="No purchase orders found."
      />
    </div>
  );
}
