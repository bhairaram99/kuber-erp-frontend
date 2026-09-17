'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, RotateCcw, History, AlertTriangle } from 'lucide-react';
import { productService } from '../../../services/product.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { StockActionDialogs } from '../../../components/inventory/stock-action-dialogs';
import { Product } from '../../../types';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function StockManagementPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['stock-products', page, search],
    queryFn: () =>
      productService.findPaginated({
        page,
        limit: 15,
        search: search || undefined,
      }),
  });

  const columns: Column<Product>[] = [
    {
      header: 'Product / SKU',
      cell: (row) => (
        <div>
          <Link
            href={`/products/${row._id}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-red-600 transition"
          >
            {row.name}
          </Link>
          <p className="text-xs text-slate-500 font-mono">{row.sku}</p>
        </div>
      ),
    },
    {
      header: 'Type / Sheet',
      cell: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.woodType} • {row.grade}
          </p>
          <p className="text-[11px] text-slate-500">
            {row.thickness ? `${row.thickness}×${row.width}×${row.length} mm` : '-'}
          </p>
        </div>
      ),
    },
    {
      header: 'Current Stock',
      cell: (row) => {
        const isLow = row.currentStock <= row.minimumStock && row.currentStock > 0;
        const isOut = row.currentStock <= 0;
        return (
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold text-xs ${
                isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'
              }`}
            >
              {row.currentStock} {row.unit}
            </span>
            {isLow && (
              <Badge variant="warning" className="text-[9px] px-1 py-0">
                Low
              </Badge>
            )}
            {isOut && (
              <Badge variant="destructive" className="text-[9px] px-1 py-0">
                Out
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Minimum',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {row.minimumStock} {row.unit}
        </span>
      ),
    },
    {
      header: 'Location',
      cell: (row) => <span className="text-xs text-slate-600 dark:text-slate-400">{row.location || '-'}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock Management"
        description="See current sheet quantities and adjust or reset stock levels."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inventory & Stock', href: '/inventory' },
          { label: 'Stock Management' },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/inventory/ledger">
              <Button variant="outline">
                <History className="w-4 h-4 mr-1.5" />
                Stock Ledger
              </Button>
            </Link>
            <PermissionGuard permission={PERMISSIONS.INVENTORY_ADJUST}>
              <Button
                onClick={() => setIsAdjustOpen(true)}
                className="bg-[#E11F2B] hover:bg-[#c91924] text-white font-medium"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Adjust Stock
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.INVENTORY_RESET}>
              <Button
                variant="outline"
                onClick={() => setIsResetOpen(true)}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset Stock Level
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
        <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
        Use Adjust Stock for day-to-day corrections. Open Stock Ledger to review every movement.
      </div>

      <DataTable
        columns={columns}
        data={productsRes?.data || []}
        isLoading={isLoading}
        pagination={productsRes?.pagination}
        onPageChange={setPage}
        searchPlaceholder="Search product, SKU, wood type..."
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
      />

      <StockActionDialogs
        isAdjustOpen={isAdjustOpen}
        isResetOpen={isResetOpen}
        onAdjustClose={() => setIsAdjustOpen(false)}
        onResetClose={() => setIsResetOpen(false)}
      />
    </div>
  );
}
