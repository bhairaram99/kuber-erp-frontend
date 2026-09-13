'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Receipt, Plus, Trash2, Search, Check, AlertCircle } from 'lucide-react';
import { expenseService } from '../../../services/expense.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Expense } from '../../../types';

export default function ExpensesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [category, setCategory] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [expCategory, setExpCategory] = useState('LOGISTICS');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', page, limit, category],
    queryFn: () =>
      expenseService.findPaginated({
        page,
        limit,
        category: category || undefined,
      }),
  });

  const { data: breakdownData } = useQuery({
    queryKey: ['expenses-breakdown'],
    queryFn: () => expenseService.getCategoryBreakdown(),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => expenseService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-breakdown'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to record expense.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expenseService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['expenses-breakdown'] });
    },
  });

  const resetForm = () => {
    setTitle('');
    setExpCategory('LOGISTICS');
    setAmount(0);
    setPaymentMethod('BANK_TRANSFER');
    setDescription('');
    setFormError('');
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) {
      setFormError('Please enter a valid title and amount greater than 0.');
      return;
    }

    createMutation.mutate({
      title,
      category: expCategory,
      amount: Number(amount),
      paymentMethod,
      date,
      description,
    });
  };

  const breakdown = (breakdownData as any)?.data || [];

  const columns = [
    {
      header: 'Title & Reason',
      accessorKey: 'title',
      cell: (row: Expense) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {row.title}
          </p>
          {row.description && (
            <p className="text-[11px] text-slate-400">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Category',
      accessorKey: 'category',
      cell: (row: Expense) => (
        <Badge variant="outline" className="text-[10px]">
          {row.category}
        </Badge>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'date',
      cell: (row: Expense) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.date)}
        </span>
      ),
    },
    {
      header: 'Payment Method',
      accessorKey: 'paymentMethod',
      cell: (row: Expense) => (
        <span className="text-xs text-slate-600 dark:text-slate-300">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: Expense) => (
        <span className="font-bold text-xs text-rose-600">
          -{formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Recorded By',
      accessorKey: 'createdBy',
      cell: (row: Expense) => (
        <span className="text-xs text-slate-500">
          {row.createdBy?.name || 'System'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: Expense) =>
        hasPermission(PERMISSIONS.EXPENSES_DELETE) ? (
          <button
            onClick={() => {
              if (window.confirm('Delete this expense record?')) {
                deleteMutation.mutate(row._id);
              }
            }}
            className="text-slate-400 hover:text-rose-600 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Expenses"
        description="Track sawmill utilities, timber transport, equipment maintenance, and labor costs."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Expenses' },
        ]}
        action={
          hasPermission(PERMISSIONS.EXPENSES_CREATE) ? (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Record Expense
            </Button>
          ) : undefined
        }
      />

      {/* Category Breakdown Cards */}
      {breakdown.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {breakdown.slice(0, 4).map((b: any) => (
            <Card key={b._id} className="p-4 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {b._id || 'GENERAL'}
              </span>
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {formatCurrency(b.totalAmount)}
              </p>
              <span className="text-[10px] text-slate-500 block">
                {b.count} transactions
              </span>
            </Card>
          ))}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by expense category"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Categories</option>
          <option value="LOGISTICS">Logistics & Freight</option>
          <option value="UTILITIES">Utilities & Power</option>
          <option value="SALARIES">Labor & Salaries</option>
          <option value="MAINTENANCE">Sawmill Maintenance</option>
          <option value="RENT">Yard Rent</option>
          <option value="OTHER">Other Operational</option>
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
        emptyMessage="No operational expenses recorded."
      />

      {/* Record Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Record Operational Expense
            </h3>

            {formError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Expense Title <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Timber Freight from Sawmill to Yard"
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Category
                  </label>
                  <select
                    value={expCategory}
                    onChange={(e) => setExpCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="LOGISTICS">Logistics & Freight</option>
                    <option value="UTILITIES">Utilities & Power</option>
                    <option value="SALARIES">Labor & Salaries</option>
                    <option value="MAINTENANCE">Sawmill Maintenance</option>
                    <option value="RENT">Yard Rent</option>
                    <option value="OTHER">Other Operational</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    min="1"
                    step="any"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    required
                    placeholder="0.00"
                    className="text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="BANK_TRANSFER">Bank Transfer / NEFT</option>
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Description / Remarks
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional details or receipt reference..."
                  className="w-full p-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  {createMutation.isPending ? (
                    'Saving...'
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Expense
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
