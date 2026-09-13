'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  SlidersHorizontal,
  RotateCcw,
  Boxes,
  History,
  AlertTriangle,
} from 'lucide-react';
import { inventoryService } from '../../../services/inventory.service';
import { productService } from '../../../services/product.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Select } from '../../../components/ui/select';
import { InventoryTransaction, Product } from '../../../types';
import { formatDateTime } from '../../../lib/utils';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function InventoryPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');

  // Modals state
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Form states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [adjustType, setAdjustType] = useState('ADJUSTMENT_IN');
  const [quantity, setQuantity] = useState(10);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [resetNewStock, setResetNewStock] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { data: productsRes } = useQuery({
    queryKey: ['products-all-inventory'],
    queryFn: () => productService.findPaginated({ page: 1, limit: 100 }),
  });

  const { data: historyRes, isLoading } = useQuery({
    queryKey: ['inventory-history', page, typeFilter],
    queryFn: () =>
      inventoryService.getHistory({
        page,
        limit: 15,
        type: typeFilter || undefined,
      }),
  });

  const adjustMutation = useMutation({
    mutationFn: () =>
      inventoryService.adjustStock({
        productId: selectedProductId,
        type: adjustType,
        quantity: Math.max(1, Math.round(Number(quantity) || 1)),
        reason,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsAdjustOpen(false);
      resetForms();
    },
    onError: (err: any) => {
      setError(err.message || 'Stock adjustment failed');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () =>
      inventoryService.resetStock({
        productId: selectedProductId,
        newStock: Math.max(0, Math.round(Number(resetNewStock) || 0)),
        reason,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsResetOpen(false);
      resetForms();
    },
    onError: (err: any) => {
      setError(err.message || 'Stock reset failed');
    },
  });

  const resetForms = () => {
    setSelectedProductId('');
    setQuantity(10);
    setReason('');
    setNotes('');
    setResetNewStock(0);
    setError(null);
  };

  const columns: Column<InventoryTransaction>[] = [
    {
      header: 'Timestamp',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-mono">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Product / SKU',
      cell: (row) => {
        const prod = row.productId as any;
        return (
          <div>
            <span className="font-bold text-slate-900 dark:text-slate-100">
              {prod?.name || 'Deleted Product'}
            </span>
            <p className="text-xs text-slate-500 font-mono">
              SKU: {prod?.sku || '-'}
            </p>
          </div>
        );
      },
    },
    {
      header: 'Movement Type',
      cell: (row) => {
        const typeVariants: Record<string, 'success' | 'destructive' | 'warning' | 'default' | 'secondary'> = {
          PURCHASE: 'success',
          ADJUSTMENT_IN: 'success',
          FOUND: 'success',
          SALE: 'destructive',
          ADJUSTMENT_OUT: 'destructive',
          DAMAGE: 'destructive',
          LOSS: 'destructive',
          RESET: 'warning',
          OPENING: 'secondary',
        };

        return (
          <Badge variant={typeVariants[row.type] || 'outline'}>
            {row.type}
          </Badge>
        );
      },
    },
    {
      header: 'Quantity Changed',
      cell: (row) => {
        const prod = row.productId as any;
        const roundedQty = Math.round(row.quantity);
        return (
          <span
            className={`font-black text-xs ${
              roundedQty > 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {roundedQty > 0 ? `+${roundedQty}` : roundedQty} {prod?.unit || 'units'}
          </span>
        );
      },
    },
    {
      header: 'Stock Shift',
      cell: (row) => {
        const prod = row.productId as any;
        const prev = Math.round(row.previousStock);
        const next = Math.round(row.newStock);
        return (
          <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
            {prev} → <span className="font-bold text-slate-900 dark:text-slate-100">{next}</span> {prod?.unit}
          </span>
        );
      },
    },
    {
      header: 'Reason & Reference',
      cell: (row) => (
        <div>
          <span className="text-xs font-medium text-slate-800 dark:text-slate-200">
            {row.reason || row.referenceType}
          </span>
          {row.referenceId && (
            <p className="text-[11px] text-slate-400 font-mono">Ref: {row.referenceId}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Logged By',
      cell: (row) => (
        <span className="text-xs text-slate-500">
          {(row.createdBy as any)?.name || 'System Admin'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory Operations & Stock Ledger"
        description="Authoritative audit trail of every wood stock adjustment, physical count reconciliations, and movement transactions."
        actions={
          <div className="flex items-center gap-2">
            <PermissionGuard permission={PERMISSIONS.INVENTORY_ADJUST}>
              <Button
                onClick={() => {
                  resetForms();
                  setIsAdjustOpen(true);
                }}
                className="bg-[#E11F2B] hover:bg-[#c91924] text-white font-medium"
              >
                <SlidersHorizontal className="w-4 h-4 mr-1.5" />
                Adjust Stock
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.INVENTORY_RESET}>
              <Button
                variant="outline"
                onClick={() => {
                  resetForms();
                  setIsResetOpen(true);
                }}
                className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              >
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Reset Stock Level
              </Button>
            </PermissionGuard>
          </div>
        }
      />

      <DataTable
        columns={columns}
        data={historyRes?.data || []}
        isLoading={isLoading}
        pagination={historyRes?.pagination}
        onPageChange={setPage}
        filterComponent={
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs"
          >
            <option value="">All Movement Types</option>
            <option value="SALE">SALE</option>
            <option value="PURCHASE">PURCHASE</option>
            <option value="ADJUSTMENT_IN">ADJUSTMENT_IN</option>
            <option value="ADJUSTMENT_OUT">ADJUSTMENT_OUT</option>
            <option value="DAMAGE">DAMAGE</option>
            <option value="LOSS">LOSS</option>
            <option value="FOUND">FOUND</option>
            <option value="RESET">RESET</option>
          </select>
        }
      />

      {/* Adjust Stock Modal */}
      <Dialog
        isOpen={isAdjustOpen}
        onClose={() => setIsAdjustOpen(false)}
        title="Manual Stock Adjustment"
        description="Record physical stock discrepancies, damage, loss, or recount additions with mandatory business reason."
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adjustMutation.mutate();
          }}
          className="space-y-4"
        >
          <Select
            label="Product Material *"
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select Wood Material</option>
            {productsRes?.data?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku}) — Available: {Math.round(p.currentStock)} {p.unit}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Adjustment Nature *"
              value={adjustType}
              onChange={(e) => setAdjustType(e.target.value)}
            >
              <option value="ADJUSTMENT_IN">ADJUSTMENT IN (Stock Addition)</option>
              <option value="ADJUSTMENT_OUT">ADJUSTMENT OUT (Stock Reduction)</option>
              <option value="DAMAGE">DAMAGE (Termites, Rot, Broken)</option>
              <option value="LOSS">LOSS (Misplaced, Shrinkage)</option>
              <option value="FOUND">FOUND (Discovered in Yard)</option>
              <option value="CORRECTION">COUNT CORRECTION</option>
            </Select>

            <Input
              label="Quantity to Adjust (Whole Number) *"
              type="number"
              min="1"
              step="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.round(Number(e.target.value) || 1)))}
            />
          </div>

          <Input
            label="Reason for Adjustment *"
            required
            placeholder="e.g. Physical recount showed excess planks in Yard A"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Input
            label="Internal Notes"
            placeholder="Authorized by warehouse lead..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#E11F2B] hover:bg-[#c91924] text-white font-medium"
              isLoading={adjustMutation.isPending}
            >
              Apply Adjustment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Sensitive Reset Stock Modal */}
      <Dialog
        isOpen={isResetOpen}
        onClose={() => setIsResetOpen(false)}
        title="⚠️ Reset Stock to Baseline"
        description="High-security operation. Overwrites product current stock directly and generates a mandatory RESET audit transaction."
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            resetMutation.mutate();
          }}
          className="space-y-4"
        >
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-200 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600" />
            <span>
              This will forcefully set the product inventory count to the specified baseline.
              Historical movement logs remain intact.
            </span>
          </div>

          <Select
            label="Target Material *"
            required
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">Select Wood Material</option>
            {productsRes?.data?.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.sku}) — Current: {Math.round(p.currentStock)} {p.unit}
              </option>
            ))}
          </Select>

          <Input
            label="New Baseline Stock (Whole Number) *"
            type="number"
            min="0"
            step="1"
            required
            value={resetNewStock}
            onChange={(e) => setResetNewStock(Math.max(0, Math.round(Number(e.target.value) || 0)))}
          />

          <Input
            label="Justification Reason *"
            required
            placeholder="e.g. Annual fiscal stock audit reconciliation by chartered accountant"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          <Input
            label="Approval Notes"
            placeholder="Approved by Managing Director..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsResetOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#c91924] hover:bg-[#a8141d] text-white font-medium"
              isLoading={resetMutation.isPending}
            >
              Confirm Stock Reset
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
