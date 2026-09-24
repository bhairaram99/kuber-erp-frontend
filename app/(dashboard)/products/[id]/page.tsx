'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Edit2, Boxes, DollarSign, History, Layers } from 'lucide-react';
import { productService } from '../../../../services/product.service';
import { inventoryService } from '../../../../services/inventory.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { formatCurrency, formatDateTime } from '../../../../lib/utils';
import { PermissionGuard } from '../../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../../lib/permissions';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.findById(id),
    enabled: !!id,
  });

  const { data: historyRes } = useQuery({
    queryKey: ['product-history', id],
    queryFn: () => inventoryService.getHistory({ productId: id, limit: 10 }),
    enabled: !!id,
  });

  const product = productRes?.data;
  const history = historyRes?.data || [];

  if (isLoading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-8 text-center text-sm text-rose-500">Product not found</div>;
  }

  const stockValuation = (product.currentStock || 0) * (product.purchasePrice || 0);
  const retailValuation = (product.currentStock || 0) * (product.sellingPrice || 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={product.name}
        description={`SKU: ${product.sku} • Category: ${(product.categoryId as any)?.name || 'Uncategorized'}`}
        actions={
          <div className="flex items-center gap-2">
            <a href="/products">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
              </Button>
            </a>
            <PermissionGuard permission={PERMISSIONS.PRODUCTS_UPDATE}>
              <a href={`/products/${product._id}/edit`}>
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                  <Edit2 className="w-4 h-4 mr-1.5" /> Edit Specs
                </Button>
              </a>
            </PermissionGuard>
          </div>
        }
      />

      {/* Highlights / Valuation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Current Stock</span>
              <Boxes className="h-4 w-4 text-red-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {product.currentStock} {product.unit}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Min: {product.minimumStock}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Valuation (Cost)</span>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-emerald-600">
                {formatCurrency(stockValuation)}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                @{formatCurrency(product.purchasePrice)}/unit
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Valuation (Retail)</span>
              <DollarSign className="h-4 w-4 text-blue-600" />
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-blue-600">
                {formatCurrency(retailValuation)}
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                @{formatCurrency(product.sellingPrice)}/unit
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase">Storage Location</span>
              <Layers className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-2">
              <span className="text-lg font-bold text-slate-800 dark:text-slate-200">
                {product.location}
              </span>
              <div className="mt-1">
                <Badge variant={product.status === 'ACTIVE' ? 'success' : 'secondary'}>
                  {product.status}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Specifications Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Lumber Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Wood Species</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.woodType}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Lumber Grade</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.grade}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Quality Tier</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.quality}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Physical Dimensions (TxWxL)</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {product.thickness} x {product.width} x {product.length} mm
              </span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Surface Finish</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.finish}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Color Tone</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.color || '-'}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Brand / Source</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{product.brand}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Commercial Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Purchase / Landed Cost</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(product.purchasePrice)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Retail Selling Price</span>
              <span className="font-bold text-emerald-600">{formatCurrency(product.sellingPrice)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Wholesale Bulk Price</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(product.wholesalePrice)}</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500">Unit Margin (Retail - Cost)</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(product.sellingPrice - product.purchasePrice)} (
                {product.purchasePrice > 0
                  ? (((product.sellingPrice - product.purchasePrice) / product.purchasePrice) * 100).toFixed(1)
                  : 0}
                %)
              </span>
            </div>
            {product.notes && (
              <div className="py-2.5 flex flex-col gap-1">
                <span className="text-slate-500">Operational Notes:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{product.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stock Movement History */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-red-600" />
            <span>Recent Stock Movements for this Material</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No recent stock movements recorded.
              </div>
            ) : (
              history.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-bold text-[10px]">
                        {tx.type}
                      </Badge>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {tx.reason || tx.referenceType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {formatDateTime(tx.createdAt)} • Ref: {tx.referenceId || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-extrabold text-sm ${
                        tx.quantity > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.quantity > 0 ? `+${tx.quantity}` : tx.quantity} {product.unit}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      Balance: {tx.newStock} {product.unit}
                    </p>
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
