'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftRight, Search, Filter } from 'lucide-react';
import { transactionService } from '../../../services/transaction.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { formatCurrency, formatDateTime } from '../../../lib/utils';
import { CentralTransaction } from '../../../types';

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, limit, search, type],
    queryFn: () =>
      transactionService.findPaginated({
        page,
        limit,
        search,
        type: type || undefined,
      }),
  });

  const getTypeVariant = (t: string) => {
    switch (t) {
      case 'SALE':
      case 'PAYMENT_RECEIVED':
        return 'success';
      case 'PURCHASE':
      case 'PAYMENT_SENT':
      case 'EXPENSE':
        return 'destructive';
      case 'STOCK_ADJUSTMENT':
        return 'warning';
      default:
        return 'default';
    }
  };

  const columns = [
    {
      header: 'Txn #',
      accessorKey: 'transactionNumber',
      cell: (row: CentralTransaction) => (
        <span className="font-semibold text-red-600 dark:text-red-400 text-xs">
          {row.transactionNumber}
        </span>
      ),
    },
    {
      header: 'Date & Time',
      accessorKey: 'createdAt',
      cell: (row: CentralTransaction) => (
        <span className="text-xs text-slate-500">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row: CentralTransaction) => (
        <Badge variant={getTypeVariant(row.type)} className="text-[10px]">
          {row.type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: 'Party / Reference',
      accessorKey: 'description',
      cell: (row: CentralTransaction) => {
        const party = row.customerId?.name || row.supplierId?.name || null;
        return (
          <div>
            {party && (
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                {party}
              </p>
            )}
            <p className="text-[11px] text-slate-500 line-clamp-1">
              {row.description || `Ref: ${row.referenceType}`}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: CentralTransaction) => {
        const isPositive =
          row.type === 'SALE' || row.type === 'PAYMENT_RECEIVED';
        return (
          <span
            className={`font-bold text-xs ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-900 dark:text-slate-100'
            }`}
          >
            {isPositive ? '+' : '-'}
            {formatCurrency(row.amount)}
          </span>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'paymentStatus',
      cell: (row: CentralTransaction) => (
        <Badge
          variant={
            row.paymentStatus === 'PAID'
              ? 'success'
              : row.paymentStatus === 'PARTIAL'
              ? 'warning'
              : 'secondary'
          }
          className="text-[10px]"
        >
          {row.paymentStatus || row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Central Financial Ledger"
        description="Unified audit trail of every monetary and inventory transaction across the business."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Transactions' },
        ]}
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search transaction number or description..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by transaction type"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Transaction Types</option>
          <option value="SALE">SALE</option>
          <option value="PURCHASE">PURCHASE</option>
          <option value="PAYMENT_RECEIVED">PAYMENT RECEIVED</option>
          <option value="PAYMENT_SENT">PAYMENT SENT</option>
          <option value="EXPENSE">EXPENSE</option>
          <option value="STOCK_ADJUSTMENT">STOCK ADJUSTMENT</option>
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
        emptyMessage="No central transactions recorded yet."
      />
    </div>
  );
}
