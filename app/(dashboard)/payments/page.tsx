'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Search, Check, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { paymentService } from '../../../services/payment.service';
import { customerService } from '../../../services/customer.service';
import { supplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Payment, Customer, Supplier } from '../../../types';

export default function PaymentsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [type, setType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [paymentType, setPaymentType] = useState<'RECEIVED' | 'SENT'>('RECEIVED');
  const [partyId, setPartyId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('BANK_TRANSFER');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page, limit, type],
    queryFn: () =>
      paymentService.findPaginated({
        page,
        limit,
        type: type || undefined,
      }),
  });

  const { data: customersData } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => customerService.findAll(),
    enabled: isModalOpen && paymentType === 'RECEIVED',
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['all-suppliers'],
    queryFn: () => supplierService.findAll(),
    enabled: isModalOpen && paymentType === 'SENT',
  });

  const customers: Customer[] = (customersData as any)?.data || [];
  const suppliers: Supplier[] = (suppliersData as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => paymentService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to record payment.');
    },
  });

  const resetForm = () => {
    setPartyId('');
    setAmount(0);
    setPaymentMethod('BANK_TRANSFER');
    setNotes('');
    setFormError('');
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) {
      setFormError(`Please select a ${paymentType === 'RECEIVED' ? 'customer' : 'supplier'}.`);
      return;
    }
    if (amount <= 0) {
      setFormError('Payment amount must be greater than 0.');
      return;
    }

    createMutation.mutate({
      type: paymentType,
      customerId: paymentType === 'RECEIVED' ? partyId : undefined,
      supplierId: paymentType === 'SENT' ? partyId : undefined,
      amount: Number(amount),
      paymentMethod,
      notes,
    });
  };

  const columns = [
    {
      header: 'Payment #',
      accessorKey: 'paymentNumber',
      cell: (row: Payment) => (
        <span className="font-semibold text-red-600 dark:text-red-400 text-xs">
          {row.paymentNumber}
        </span>
      ),
    },
    {
      header: 'Date',
      accessorKey: 'paymentDate',
      cell: (row: Payment) => (
        <span className="text-xs text-slate-500">
          {formatDate(row.paymentDate)}
        </span>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'type',
      cell: (row: Payment) => (
        <Badge
          variant={row.type === 'RECEIVED' ? 'success' : 'destructive'}
          className="gap-1 text-[10px]"
        >
          {row.type === 'RECEIVED' ? (
            <ArrowDownLeft className="h-3 w-3" />
          ) : (
            <ArrowUpRight className="h-3 w-3" />
          )}
          {row.type === 'RECEIVED' ? 'CUSTOMER RECEIPT' : 'SUPPLIER PAYMENT'}
        </Badge>
      ),
    },
    {
      header: 'Party',
      accessorKey: 'party',
      cell: (row: Payment) => {
        const party = row.customerId || row.supplierId;
        return (
          <div>
            <p className="font-medium text-xs text-slate-900 dark:text-slate-100">
              {party?.name || 'Direct / General'}
            </p>
            {party?.company && (
              <p className="text-[10px] text-slate-400">{party.company}</p>
            )}
          </div>
        );
      },
    },
    {
      header: 'Method',
      accessorKey: 'paymentMethod',
      cell: (row: Payment) => (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          {row.paymentMethod}
        </span>
      ),
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: (row: Payment) => (
        <span
          className={`font-bold text-xs ${
            row.type === 'RECEIVED'
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-slate-100'
          }`}
        >
          {row.type === 'RECEIVED' ? '+' : '-'}
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Recorded By',
      accessorKey: 'createdBy',
      cell: (row: Payment) => (
        <span className="text-xs text-slate-500">
          {row.createdBy?.name || 'System'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments & Cash Flow"
        description="Record customer receipts, settle supplier payables, and maintain balanced accounts."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Payments' },
        ]}
        action={
          hasPermission(PERMISSIONS.PAYMENTS_CREATE) ? (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Record Payment
            </Button>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <div className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by payment direction"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Payment Types</option>
          <option value="RECEIVED">Customer Receipts (Inward)</option>
          <option value="SENT">Supplier Payments (Outward)</option>
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
        emptyMessage="No payment records found."
      />

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Record Financial Payment
            </h3>

            {formError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleRecordPayment} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Direction
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('RECEIVED');
                      setPartyId('');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      paymentType === 'RECEIVED'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Customer Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentType('SENT');
                      setPartyId('');
                    }}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      paymentType === 'SENT'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                        : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    Supplier Payment
                  </button>
                </div>
              </div>

              {/* Party Select */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  {paymentType === 'RECEIVED' ? 'Select Customer' : 'Select Supplier'}{' '}
                  <span className="text-rose-500">*</span>
                </label>
                <select
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="">
                    -- Choose {paymentType === 'RECEIVED' ? 'Customer' : 'Supplier'} --
                  </option>
                  {paymentType === 'RECEIVED'
                    ? customers.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name} — Outstanding Due: {formatCurrency(c.totalDue || 0)}
                        </option>
                      ))
                    : suppliers.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name} — Outstanding Due: {formatCurrency(s.totalDue || 0)}
                        </option>
                      ))}
                </select>
              </div>

              {/* Amount */}
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
                  className="text-sm font-bold"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="BANK_TRANSFER">Bank Transfer / NEFT / RTGS</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="CASH">Cash</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Reference / Notes
                </label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Cheque #, UTR transaction ID, or notes..."
                  className="text-xs"
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
                    'Recording...'
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Payment
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
