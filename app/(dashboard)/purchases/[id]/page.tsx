'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Printer,
  Truck,
  CreditCard,
} from 'lucide-react';
import { purchaseService } from '../../../../services/purchase.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { formatCurrency, formatDate } from '../../../../lib/utils';

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ['purchase', purchaseId],
    queryFn: () => purchaseService.findById(purchaseId),
  });

  const purchase = (data as any)?.data;

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 animate-pulse">
        Loading purchase order details...
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="p-8 text-center text-rose-500">
        Purchase order not found.
      </div>
    );
  }

  const supplier = purchase.supplierId as any;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Purchase Order: ${purchase.purchaseNumber}`}
        description={`Inward shipment received on ${formatDate(purchase.purchaseDate)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Purchases', href: '/purchases' },
          { label: purchase.purchaseNumber },
        ]}
        action={
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print PO
            </Button>
          </div>
        }
      />

      {/* PO Card */}
      <Card className="p-8 space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200 shadow-xs">
                <img src="/logo.png" alt="Kuber Plywood" className="h-full w-full object-contain" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Kuber Plywood Mart
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Industrial Area, Timber Market Yard, Hubli, Karnataka
            </p>
            <p className="text-xs text-slate-500">GSTIN: 29AAAAA0000A1Z5</p>
          </div>

          <div className="text-right sm:text-right">
            <h3 className="text-lg font-bold text-red-600 dark:text-red-500">
              PURCHASE RECEIPT
            </h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {purchase.purchaseNumber}
            </p>
            <p className="text-xs text-slate-500">
              Date: {formatDate(purchase.purchaseDate)}
            </p>
            <div className="flex gap-1.5 justify-end mt-2">
              <Badge
                variant={
                  purchase.paymentStatus === 'PAID'
                    ? 'success'
                    : purchase.paymentStatus === 'PARTIAL'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {purchase.paymentStatus}
              </Badge>
              <Badge
                variant={
                  purchase.status === 'CONFIRMED' ? 'default' : 'destructive'
                }
              >
                {purchase.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Supplier & Payment Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5 text-red-600" /> Supplier
              Information
            </h4>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {supplier?.name || 'Unknown Supplier'}
            </p>
            {supplier?.company && (
              <p className="text-slate-600 dark:text-slate-400">
                {supplier.company}
              </p>
            )}
            {supplier?.phone && (
              <p className="text-slate-500">Phone: {supplier.phone}</p>
            )}
            {supplier?.address && (
              <p className="text-slate-500">{supplier.address}</p>
            )}
            {supplier?.taxNumber && (
              <p className="text-slate-500">GST: {supplier.taxNumber}</p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 sm:justify-end">
              <CreditCard className="h-3.5 w-3.5 text-red-600" /> Payment &
              Disbursement
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Payment Method:{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {purchase.paymentMethod}
              </span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Recorded By: {purchase.createdBy?.name || 'System'}
            </p>
            {purchase.notes && (
              <p className="text-slate-500 italic mt-2">
                Notes: {purchase.notes}
              </p>
            )}
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Material Description</th>
                <th className="p-3">SKU</th>
                <th className="p-3 text-right">Qty Received</th>
                <th className="p-3 text-right">Cost Price (₹)</th>
                <th className="p-3 text-right">Tax (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {purchase.items?.map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-medium text-slate-900 dark:text-slate-100">
                    {item.productNameSnapshot}
                  </td>
                  <td className="p-3 text-slate-500">{item.skuSnapshot}</td>
                  <td className="p-3 text-right font-semibold">
                    {item.quantity} {item.unitSnapshot}
                  </td>
                  <td className="p-3 text-right">
                    {formatCurrency(item.purchasePrice)}
                  </td>
                  <td className="p-3 text-right text-slate-500">
                    {item.tax ? formatCurrency(item.tax) : '-'}
                  </td>
                  <td className="p-3 text-right font-bold text-slate-900 dark:text-slate-100">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(purchase.subtotal)}
              </span>
            </div>
            {purchase.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Supplier Discount:</span>
                <span>-{formatCurrency(purchase.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Input GST:</span>
              <span className="font-semibold">
                +{formatCurrency(purchase.tax)}
              </span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>Total Cost:</span>
              <span className="text-red-600 dark:text-red-400 text-base">
                {formatCurrency(purchase.total)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold pt-1">
              <span>Paid Amount:</span>
              <span>{formatCurrency(purchase.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t">
              <span className="text-slate-600 dark:text-slate-400">
                Payable Due:
              </span>
              <span
                className={
                  purchase.dueAmount > 0
                    ? 'text-rose-600 font-bold'
                    : 'text-emerald-600'
                }
              >
                {formatCurrency(purchase.dueAmount)}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
