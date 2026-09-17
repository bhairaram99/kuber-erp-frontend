'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Boxes } from 'lucide-react';
import { inventoryService } from '../../../../services/inventory.service';
import { PageHeader } from '../../../../components/common/page-header';
import { DataTable, Column } from '../../../../components/common/data-table';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { InventoryTransaction } from '../../../../types';
import { formatDateTime } from '../../../../lib/utils';

export default function StockLedgerPage() {
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['inventory-history', page, typeFilter],
    queryFn: () =>
      inventoryService.getHistory({
        page,
        limit: 15,
        type: typeFilter || undefined,
      }),
  });

  const columns: Column<InventoryTransaction>[] = [
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-mono">{formatDateTime(row.createdAt)}</span>
      ),
    },
    {
      header: 'Product / SKU',
      cell: (row) => {
        const prod = row.productId as any;
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {prod?.name || 'Deleted Product'}
            </span>
            <p className="text-xs text-slate-500 font-mono">SKU: {prod?.sku || '-'}</p>
          </div>
        );
      },
    },
    {
      header: 'Movement Type',
      cell: (row) => {
        const typeVariants: Record<
          string,
          'success' | 'destructive' | 'warning' | 'default' | 'secondary'
        > = {
          PURCHASE: 'success',
          ADJUSTMENT_IN: 'success',
          FOUND: 'success',
          SALE: 'destructive',
          ADJUSTMENT_OUT: 'destructive',
          DAMAGE: 'destructive',
          LOSS: 'destructive',
          RESET: 'warning',
          OPENING: 'secondary',
        };

        return <Badge variant={typeVariants[row.type] || 'outline'}>{row.type}</Badge>;
      },
    },
    {
      header: 'Quantity Changed',
      cell: (row) => {
        const prod = row.productId as any;
        const roundedQty = Math.round(row.quantity);
        return (
          <span className={`font-black text-xs ${roundedQty > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {roundedQty > 0 ? `+${roundedQty}` : roundedQty} {prod?.unit || 'units'}
          </span>
        );
      },
    },
    {
      header: 'Stock Shift',
      cell: (row) => {
        const prod = row.productId as any;
        const prev = Math.round(row.previousStock);
        const next = Math.round(row.newStock);
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {prev} → <span className="font-bold text-slate-900 dark:text-slate-100">{next}</span> {prod?.unit}
          </span>
        );
      },
    },
    {
      header: 'Reason & Reference',
      cell: (row) => (
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.reason || row.referenceType}
          </span>
          {row.referenceId && (
            <p className="text-[11px] text-slate-400 font-mono">Ref: {row.referenceId}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Logged By',
      cell: (row) => (
        <span className="text-xs text-slate-500">{(row.createdBy as any)?.name || 'System Admin'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Ledger"
        description="Complete movement history for purchases, sales, adjustments, damage, and stock resets."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory & Stock', href: '/inventory' },
          { label: 'Stock Ledger' },
        ]}
        actions={
          <Link href="/inventory">
            <Button variant="outline">
              <Boxes className="w-4 h-4 mr-1.5" />
              Stock Management
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={historyRes?.data || []}
        isLoading={isLoading}
        pagination={historyRes?.pagination}
        onPageChange={setPage}
        emptyMessage="No stock movements recorded yet."
        filterComponent={
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            <option value="">All Movement Types</option>
            <option value="SALE">SALE</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="ADJUSTMENT_IN">ADJUSTMENT_IN</option>
            <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT</option>
            <option value="DAMAGE">DAMAGE</option>
            <option value="LOSS">LOSS</option>
            <option value="FOUND">FOUND</option>
            <option value="RESET">RESET</option>
          </select>
        }
      />
    </div>
  );
}
