'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Printer,
  Ban,
  Building2,
  CreditCard,
  AlertCircle,
  FileDown,
} from 'lucide-react';
import { salesService } from '../../../../services/sales.service';
import { settingService } from '../../../../services/setting.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card } from '../../../../components/ui/card';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import { downloadSaleInvoicePdf, printSaleInvoice, toBusinessProfile } from '../../../../lib/documents';
import { useAuth } from '../../../../providers/auth-provider';
import { useToast } from '../../../../providers/toast-provider';
import { PERMISSIONS } from '../../../../lib/permissions';

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const { showToast } = useToast();
  const saleId = params.id as string;
  const [cancelError, setCancelError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['sale', saleId],
    queryFn: () => salesService.findById(saleId),
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.getSettings(),
  });

  const cancelMutation = useMutation({
    mutationFn: () => salesService.cancel(saleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sale', saleId] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
    onError: (err: any) => {
      setCancelError(err.message || 'Failed to cancel invoice.');
    },
  });

  const sale = (data as any)?.data;
  const business = toBusinessProfile(settingsRes?.data);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-sm text-slate-500 animate-pulse">
        Loading invoice details...
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-8 text-center text-rose-500">
        Sale invoice not found.
      </div>
    );
  }

  const customer = sale.customerId as any;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title={`Invoice: ${sale.invoiceNumber}`}
        description={`Issued on ${formatDate(sale.saleDate)}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/sales' },
          { label: sale.invoiceNumber },
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
              onClick={() => {
                try {
                  printSaleInvoice(sale, business);
                  showToast('Print preview is ready. Choose a printer or Save as PDF.', 'success');
                } catch (error: any) {
                  showToast(error?.message || 'Unable to print this invoice right now.', 'error');
                }
              }}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                try {
                  downloadSaleInvoicePdf(sale, business);
                  showToast('Invoice PDF downloaded successfully.', 'success');
                } catch (error: any) {
                  showToast(error?.message || 'Unable to download the PDF right now.', 'error');
                }
              }}
              className="gap-1.5"
            >
              <FileDown className="h-4 w-4" /> PDF
            </Button>
            {sale.status !== 'CANCELLED' &&
              hasPermission(PERMISSIONS.SALES_CANCEL) && (
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={cancelMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to cancel this sale? Stock will be reversed back to inventory.',
                      )
                    ) {
                      cancelMutation.mutate();
                    }
                  }}
                  className="gap-1.5"
                >
                  <Ban className="h-4 w-4" /> Cancel Invoice
                </Button>
              )}
          </div>
        }
      />

      {cancelError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{cancelError}</span>
        </div>
      )}

      {/* Invoice Card */}
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
              TAX INVOICE
            </h3>
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              {sale.invoiceNumber}
            </p>
            <p className="text-xs text-slate-500">
              Date: {formatDate(sale.saleDate)}
            </p>
            <div className="flex gap-1.5 justify-end mt-2">
              <Badge
                variant={
                  sale.paymentStatus === 'PAID'
                    ? 'success'
                    : sale.paymentStatus === 'PARTIAL'
                    ? 'warning'
                    : 'destructive'
                }
              >
                {sale.paymentStatus}
              </Badge>
              <Badge
                variant={
                  sale.status === 'CONFIRMED' ? 'default' : 'destructive'
                }
              >
                {sale.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* Customer & Payment Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-red-600" /> Billed To
            </h4>
            <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
              {customer?.name || 'Walk-in Customer'}
            </p>
            {customer?.company && (
              <p className="text-slate-600 dark:text-slate-400">
                {customer.company}
              </p>
            )}
            {customer?.phone && (
              <p className="text-slate-500">Phone: {customer.phone}</p>
            )}
            {customer?.address && (
              <p className="text-slate-500">{customer.address}</p>
            )}
            {customer?.taxNumber && (
              <p className="text-slate-500">GST: {customer.taxNumber}</p>
            )}
          </div>

          <div className="sm:text-right space-y-1">
            <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5 sm:justify-end">
              <CreditCard className="h-3.5 w-3.5 text-red-600" /> Payment
              Details
            </h4>
            <p className="text-slate-600 dark:text-slate-400">
              Payment Method:{' '}
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {sale.paymentMethod}
              </span>
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Created By: {sale.createdBy?.name || 'System'}
            </p>
            {sale.notes && (
              <p className="text-slate-500 italic mt-2">Notes: {sale.notes}</p>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Product Description</th>
                <th className="p-3">SKU</th>
                <th className="p-3 text-right">Qty / Unit</th>
                <th className="p-3 text-right">Unit Price (₹)</th>
                <th className="p-3 text-right">Disc (₹)</th>
                <th className="p-3 text-right">Tax (₹)</th>
                <th className="p-3 text-right">Total (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sale.items?.map((item: any, idx: number) => (
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
                    {formatCurrency(item.sellingPrice)}
                  </td>
                  <td className="p-3 text-right text-emerald-600">
                    {item.discount ? formatCurrency(item.discount) : '-'}
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

        {/* Totals Section */}
        <div className="flex justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal:</span>
              <span className="font-semibold">
                {formatCurrency(sale.subtotal)}
              </span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount:</span>
                <span>-{formatCurrency(sale.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>GST Tax:</span>
              <span className="font-semibold">+{formatCurrency(sale.tax)}</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
              <span>Grand Total:</span>
              <span className="text-red-600 dark:text-red-400 text-base">
                {formatCurrency(sale.total)}
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 font-semibold pt-1">
              <span>Paid Amount:</span>
              <span>{formatCurrency(sale.paidAmount)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold pt-1 border-t">
              <span className="text-slate-600 dark:text-slate-400">
                Balance Due:
              </span>
              <span
                className={
                  sale.dueAmount > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600'
                }
              >
                {formatCurrency(sale.dueAmount)}
              </span>
            </div>

            {hasPermission(PERMISSIONS.REPORTS_VIEW) && (
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg mt-3 text-[11px] space-y-1">
                <div className="flex justify-between text-slate-500">
                  <span>COGS:</span>
                  <span>{formatCurrency(sale.costOfGoodsSold)}</span>
                </div>
                <div className="flex justify-between font-semibold text-emerald-700 dark:text-emerald-400">
                  <span>Gross Profit:</span>
                  <span>{formatCurrency(sale.grossProfit)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
