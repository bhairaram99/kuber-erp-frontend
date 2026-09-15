'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Edit2, Trash2, TreePine, AlertTriangle } from 'lucide-react';
import { productService } from '../../../services/product.service';
import { categoryService } from '../../../services/category.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Select } from '../../../components/ui/select';
import { Product } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.findAll(),
  });

  const { data: productsRes, isLoading } = useQuery({
    queryKey: ['products', page, search, selectedCategory, stockFilter],
    queryFn: () =>
      productService.findPaginated({
        page,
        limit: 15,
        search: search || undefined,
        categoryId: selectedCategory || undefined,
        stockStatus: stockFilter || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<Product>[] = [
    {
      header: 'Product & SKU',
      cell: (row) => (
        <div>
          <Link
            href={`/products/${row._id}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-red-600 transition"
          >
            {row.name}
          </Link>
          <p className="text-xs text-slate-500 font-mono">
            {row.sku} {row.barcode ? `• Barcode: ${row.barcode}` : ''}
          </p>
        </div>
      ),
    },
    {
      header: 'Category & Wood',
      cell: (row) => (
        <div>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {(row.categoryId as any)?.name || 'Uncategorized'}
          </span>
          <p className="text-[11px] text-slate-500">
            {row.woodType} • {row.grade}
          </p>
        </div>
      ),
    },
    {
      header: 'Dimensions & Unit',
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.thickness ? `${row.thickness}x${row.width}x${row.length}mm` : '-'}{' '}
          <span className="font-semibold uppercase text-slate-800 dark:text-slate-200">
            ({row.unit})
          </span>
        </span>
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
                isOut
                  ? 'text-rose-600'
                  : isLow
                  ? 'text-amber-600'
                  : 'text-slate-800 dark:text-slate-200'
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
      header: 'Pricing (Buy / Sell)',
      cell: (row) => (
        <div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(row.sellingPrice)}
          </span>
          <p className="text-[10px] text-slate-400">
            Cost: {formatCurrency(row.purchasePrice)}
          </p>
        </div>
      ),
    },
    {
      header: 'Yard Location',
      accessorKey: 'location',
      className: 'text-xs text-slate-500',
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/products/${row._id}`}
            className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_UPDATE}>
            <Link
              href={`/products/${row._id}/edit`}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600"
              title="Edit Product"
            >
              <Edit2 className="w-4 h-4" />
            </Link>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_DELETE}>
            <button
              onClick={() => handleDelete(row._id, row.name)}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
              title="Delete Product"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wood Inventory & Products"
        description="Comprehensive catalog of timber logs, planks, plywood, and veneers with physical specs and pricing."
        actions={
          <PermissionGuard permission={PERMISSIONS.PRODUCTS_CREATE}>
            <Link href="/products/new">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">
                <Plus className="w-4 h-4 mr-1.5" />
                Add New Wood Material
              </Button>
            </Link>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={productsRes?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Search by name, SKU, species, location..."
        searchValue={search}
        onSearchChange={setSearch}
        pagination={productsRes?.pagination}
        onPageChange={setPage}
        filterComponent={
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="">All Categories</option>
              {categoriesRes?.data?.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
            >
              <option value="">All Stock Levels</option>
              <option value="in_stock">In Stock (&gt; 0)</option>
              <option value="low_stock">Low Stock (≤ Min)</option>
              <option value="out_of_stock">Out of Stock</option>
            </select>
          </div>
        }
      />
    </div>
  );
}
