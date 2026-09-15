'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, FileDown, Printer, ShoppingCart } from 'lucide-react';
import { customerService } from '../../../../services/customer.service';
import { salesService } from '../../../../services/sales.service';
import { paymentService } from '../../../../services/payment.service';
import { settingService } from '../../../../services/setting.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { formatCurrency, formatDate } from '../../../../lib/utils';
import {
  downloadCustomerLedgerPdf,
  printCustomerLedger,
  toBusinessProfile,
} from '../../../../lib/documents';
import { useToast } from '../../../../providers/toast-provider';

function toQueryDate(value: string, endOfDay = false): string | undefined {
  if (!value) return undefined;
  return endOfDay ? `${value}T23:59:59.999` : `${value}T00:00:00.000`;
}

export default function CustomerDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { showToast } = useToast();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const queryFrom = toQueryDate(fromDate);
  const queryTo = toQueryDate(toDate, true);

  const { data: customerRes, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerService.findById(id),
    enabled: !!id,
  });

  const { data: settingsRes } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.getSettings(),
  });

  const { data: salesRes, isLoading: salesLoading } = useQuery({
    queryKey: ['customer-sales', id, queryFrom, queryTo],
    queryFn: () =>
      salesService.findPaginated({
        customerId: id,
        limit: 500,
        from: queryFrom,
        to: queryTo,
      }),
    enabled: !!id,
  });

  const { data: paymentsRes, isLoading: paymentsLoading } = useQuery({
    queryKey: ['customer-payments', id, queryFrom, queryTo],
    queryFn: () =>
      paymentService.findPaginated({
        customerId: id,
        limit: 500,
        from: queryFrom,
        to: queryTo,
      }),
    enabled: !!id,
  });

  const customer = customerRes?.data;
  const sales = salesRes?.data || [];
  const payments = paymentsRes?.data || [];
  const business = toBusinessProfile(settingsRes?.data);

  const periodTotals = useMemo(
    () => ({
      invoiced: sales.reduce((sum, sale) => sum + Number(sale.total || 0), 0),
      received: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    }),
    [sales, payments],
  );

  const handlePrint = () => {
    if (!customer) return;
    try {
      printCustomerLedger({
        customer,
        sales,
        payments,
        from: fromDate,
        to: toDate,
        business,
      });
      showToast('Print preview is ready. Choose a printer or Save as PDF.', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Unable to print the ledger right now.', 'error');
    }
  };

  const handlePdf = () => {
    if (!customer) return;
    try {
      downloadCustomerLedgerPdf({
        customer,
        sales,
        payments,
        from: fromDate,
        to: toDate,
        business,
      });
      showToast('Customer ledger PDF downloaded successfully.', 'success');
    } catch (error: any) {
      showToast(error?.message || 'Unable to download the PDF right now.', 'error');
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-sm text-rose-500">Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={customer.name}
        description={`${customer.company || 'Direct Client'} • Code: ${customer.customerCode}`}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/customers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            </Link>
            <Link href={`/sales/new?customerId=${customer._id}`}>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                <ShoppingCart className="w-4 h-4 mr-1.5" /> Create Sale
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-50/50 dark:bg-slate-900/50">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Purchases</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(customer.totalPurchases)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase">
              Total Amount Paid
            </span>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(customer.totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800">
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400 uppercase">
              Outstanding Receivable Due
            </span>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(customer.totalDue)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Account Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-500">Contact Phone:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{customer.phone || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Email:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{customer.email || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Tax / GSTIN:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{customer.taxNumber || '-'}</p>
          </div>
          <div>
            <span className="text-slate-500">Customer Type:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">{customer.customerType || '-'}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-slate-500">Billing Address:</span>
            <p className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {customer.address} {customer.city ? `, ${customer.city}` : ''} {customer.state ? `, ${customer.state}` : ''}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row lg:items-end gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            <Input
              type="date"
              label="From Date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <Input
              type="date"
              label="To Date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setFromDate('');
                setToDate('');
              }}
            >
              All Dates
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={handlePrint} className="gap-1.5">
              <Printer className="h-4 w-4" /> Print
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handlePdf}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white"
            >
              <FileDown className="h-4 w-4" /> Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Invoices / Orders</CardTitle>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Period total: {formatCurrency(periodTotals.invoiced)}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {salesLoading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading invoices...</div>
              ) : sales.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No invoices in this date range</div>
              ) : (
                sales.map((sale) => (
                  <div key={sale._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <Link href={`/sales/${sale._id}`} className="font-bold text-red-600 hover:underline">
                        {sale.invoiceNumber}
                      </Link>
                      <p className="text-[11px] text-slate-500">{formatDate(sale.saleDate)}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(sale.total)}
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant={sale.paymentStatus === 'PAID' ? 'success' : 'warning'}
                          className="text-[9px] px-1 py-0"
                        >
                          {sale.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Payment Receipts</CardTitle>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Period total: {formatCurrency(periodTotals.received)}
            </p>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {paymentsLoading ? (
                <div className="py-6 text-center text-xs text-slate-400">Loading receipts...</div>
              ) : payments.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">No payments in this date range</div>
              ) : (
                payments.map((pmt) => (
                  <div key={pmt._id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {pmt.paymentNumber}
                      </span>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(pmt.paymentDate)} via {pmt.paymentMethod}
                      </p>
                    </div>
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {formatCurrency(pmt.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
