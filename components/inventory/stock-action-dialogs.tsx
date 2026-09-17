'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import { inventoryService } from '../../services/inventory.service';
import { productService } from '../../services/product.service';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface StockActionDialogsProps {
  isAdjustOpen: boolean;
  isResetOpen: boolean;
  onAdjustClose: () => void;
  onResetClose: () => void;
}

export function StockActionDialogs({
  isAdjustOpen,
  isResetOpen,
  onAdjustClose,
  onResetClose,
}: StockActionDialogsProps) {
  const queryClient = useQueryClient();
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
    enabled: isAdjustOpen || isResetOpen,
  });

  const resetForms = () => {
    setSelectedProductId('');
    setQuantity(10);
    setReason('');
    setNotes('');
    setResetNewStock(0);
    setError(null);
  };

  const invalidateStock = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory-history'] });
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: ['stock-products'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
  };

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
      invalidateStock();
      resetForms();
      onAdjustClose();
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
      invalidateStock();
      resetForms();
      onResetClose();
    },
    onError: (err: any) => {
      setError(err.message || 'Stock reset failed');
    },
  });

  const closeAdjust = () => {
    resetForms();
    onAdjustClose();
  };

  const closeReset = () => {
    resetForms();
    onResetClose();
  };

  return (
    <>
      <Dialog
        isOpen={isAdjustOpen}
        onClose={closeAdjust}
        title="Manual Stock Adjustment"
        description="Record physical stock discrepancies, damage, loss, or recount additions with a mandatory business reason."
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
            <Button type="button" variant="outline" onClick={closeAdjust}>
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

      <Dialog
        isOpen={isResetOpen}
        onClose={closeReset}
        title="Reset Stock to Baseline"
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
            placeholder="e.g. Annual fiscal stock audit reconciliation"
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
            <Button type="button" variant="outline" onClick={closeReset}>
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
    </>
  );
}
