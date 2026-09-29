'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Trash2 } from 'lucide-react';
import { customerService } from '../../../services/customer.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { DeleteConfirmDialog } from '../../../components/ui/delete-confirm-dialog';
import { Customer } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [pending, setPending] = useState<Customer | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setPending(null);
      setDeleteError(null);
    },
    onError: (err: Error) => {
      setDeleteError(err.message || 'Could not delete this customer.');
    },
  });

  const { data: customersRes, isLoading } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customerService.findPaginated({ page, limit: 15, search: search || undefined }),
  });

  const columns: Column<Customer>[] = [
    {
      header: 'Customer & Code',
      cell: (row) => (
        <div>
          <Link
            href={`/customers/${row._id}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-red-600 transition"
          >
            {row.name}
          </Link>
          <p className="text-xs text-slate-500 font-mono">
            {row.customerCode} • {row.customerType}
          </p>
        </div>
      ),
    },
    {
      header: 'Company & Contact',
      cell: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.company || '-'}
          </p>
          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
            {row.phone && <span>📞 {row.phone}</span>}
            {row.email && <span>✉️ {row.email}</span>}
          </p>
        </div>
      ),
    },
    {
      header: 'City / State',
      cell: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {row.city ? `${row.city}, ${row.state}` : 'India'}
        </span>
      ),
    },
    {
      header: 'Total Purchases',
      cell: (row) => (
        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
          {formatCurrency(row.totalPurchases)}
        </span>
      ),
    },
    {
      header: 'Paid Amount',
      cell: (row) => (
        <span className="font-bold text-xs text-emerald-600">
          {formatCurrency(row.totalPaid)}
        </span>
      ),
    },
    {
      header: 'Outstanding Balance',
      cell: (row) => {
        const isDue = (row.totalDue || 0) > 0;
        return (
          <span
            className={`font-black text-xs ${
              isDue ? 'text-rose-600' : 'text-slate-400'
            }`}
          >
            {formatCurrency(row.totalDue)}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Link href={`/customers/${row._id}`}>
            <Button variant="outline" size="sm">
              <Eye className="w-3.5 h-3.5 mr-1" /> Ledger
            </Button>
          </Link>
          <PermissionGuard permission={PERMISSIONS.CUSTOMERS_DELETE}>
            <button
              type="button"
              onClick={() => {
                setDeleteError(null);
                setPending(row);
              }}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
              title="Delete customer"
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
        title="Customer Ledger"
        description="Track furniture makers, contractors, wholesale buyers, order volumes, and payment balances."
        actions={
          <PermissionGuard permission={PERMISSIONS.CUSTOMERS_CREATE}>
            <Link href="/customers/new">
              <Button className="bg-red-600 hover:bg-red-700 text-white font-medium">
                <Plus className="w-4 h-4 mr-1.5" />
                Register Customer
              </Button>
            </Link>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={customersRes?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Search customer name, company, phone, code..."
        searchValue={search}
        onSearchChange={setSearch}
        pagination={customersRes?.pagination}
        onPageChange={setPage}
      />

      <DeleteConfirmDialog
        isOpen={!!pending}
        kind="customer"
        name={pending?.company || pending?.name || 'this customer'}
        detail="Their ledger will no longer appear in this list. Continue only if you mean to remove them."
        isLoading={deleteMutation.isPending}
        error={deleteError}
        onClose={() => {
          if (deleteMutation.isPending) return;
          setPending(null);
          setDeleteError(null);
        }}
        onConfirm={() => {
          if (pending) deleteMutation.mutate(pending._id);
        }}
      />
    </div>
  );
}
