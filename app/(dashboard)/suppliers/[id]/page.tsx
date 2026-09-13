'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ShoppingBag, Truck } from 'lucide-react';
import { supplierService } from '../../../../services/supplier.service';
import { purchaseService } from '../../../../services/purchase.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency, formatDate } from '../../../../lib/utils';

export default function SupplierDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: supplierRes, isLoading } = useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierService.findById(id),
    enabled: !!id,
  });

  const { data: purchasesRes } = useQuery({
    queryKey: ['supplier-purchases', id],
    queryFn: () => purchaseService.findPaginated({ supplierId: id, limit: 10 }),
    enabled: !!id,
  });

  const supplier = supplierRes?.data;
  const purchases = purchasesRes?.data || [];

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading supplier details...</div>;
  }

  if (!supplier) {
    return <div className="p-8 text-center text-sm text-rose-500">Supplier not found</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        description={`${supplier.company} • Code: ${supplier.supplierCode}`}
        actions={
          <div className="flex items-center gap-2">
            <a href="/suppliers">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            </a>
            <a href={`/purchases/new?supplierId=${supplier._id}`}>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                <ShoppingBag className="w-4 h-4 mr-1.5" /> Create Purchase Order
              </Button>
            </a>
          </div>
        }
      />

      {/* Financials Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Procured</span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              {formatCurrency(supplier.totalPurchases)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Paid</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(supplier.totalPaid)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-semibold text-slate-500 uppercase">Payable Due</span>
            <p className="text-2xl font-black text-red-600 mt-1">
              {formatCurrency(supplier.totalDue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Purchase Orders History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {purchases.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No purchase orders yet</div>
            ) : (
              purchases.map((po) => (
                <div key={po._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <a
                      href={`/purchases/${po._id}`}
                      className="font-bold text-red-600 hover:underline"
                    >
                      {po.purchaseNumber}
                    </a>
                    <p className="text-[11px] text-slate-500">{formatDate(po.purchaseDate)}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(po.total)}
                    </span>
                    <div className="mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1 py-0">
                        {po.paymentStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
