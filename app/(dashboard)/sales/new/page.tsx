'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import { salesService } from '../../../../services/sales.service';
import { customerService } from '../../../../services/customer.service';
import { productService } from '../../../../services/product.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card } from '../../../../components/ui/card';
import { formatCurrency } from '../../../../lib/utils';
import { Product, Customer } from '../../../../types';

interface LineItem {
  productId: string;
  product?: Product;
  quantity: number;
  sellingPrice: number;
  discount: number;
  taxPercentage: number;
}

export default function NewSalePage() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<LineItem[]>([
    {
      productId: '',
      quantity: 1,
      sellingPrice: 0,
      discount: 0,
      taxPercentage: 0,
    },
  ]);
  const [discount, setDiscount] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Customers
  const { data: customersData } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => customerService.findAll(),
  });

  // Fetch Products
  const { data: productsData } = useQuery({
    queryKey: ['all-products'],
    queryFn: () => productService.findPaginated({ limit: 100 }),
  });

  const customers: Customer[] = (customersData as any)?.data || [];
  const products: Product[] = (productsData as any)?.data || [];

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p._id === prodId);
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      productId: prodId,
      product: prod,
      sellingPrice: prod?.sellingPrice || 0,
      taxPercentage: prod?.taxPercentage || 0,
    };
    setItems(newItems);
  };

  const handleQuantityChange = (index: number, qty: number) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, qty);
    setItems(newItems);
  };

  const handlePriceChange = (index: number, price: number) => {
    const newItems = [...items];
    newItems[index].sellingPrice = Math.max(0, price);
    setItems(newItems);
  };

  const handleLineDiscountChange = (index: number, disc: number) => {
    const newItems = [...items];
    newItems[index].discount = Math.max(0, disc);
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productId: '',
        quantity: 1,
        sellingPrice: 0,
        discount: 0,
        taxPercentage: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  // Calculations
  const lineSubtotals = items.map((item) => {
    const gross = item.quantity * item.sellingPrice;
    const discounted = gross - (gross * (item.discount || 0)) / 100;
    const tax = (discounted * (item.taxPercentage || 0)) / 100;
    return { gross, discounted, tax, total: discounted + tax };
  });

  const subtotal = lineSubtotals.reduce((acc, curr) => acc + curr.gross, 0);
  const totalTax = lineSubtotals.reduce((acc, curr) => acc + curr.tax, 0);
  const totalLineDiscount = lineSubtotals.reduce(
    (acc, curr) => acc + (curr.gross - curr.discounted),
    0,
  );
  const totalBeforeOverallDiscount = subtotal - totalLineDiscount + totalTax;
  const grandTotal = Math.max(0, totalBeforeOverallDiscount - discount);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setErrorMessage('Please select a customer.');
      return;
    }

    const invalidItem = items.find((i) => !i.productId || i.quantity <= 0);
    if (invalidItem) {
      setErrorMessage('Please select a valid product and quantity for all rows.');
      return;
    }

    // Stock check
    for (const item of items) {
      if (item.product && item.quantity > item.product.currentStock) {
        setErrorMessage(
          `Insufficient stock for "${item.product.name}". Available: ${item.product.currentStock} ${item.product.unit}, requested: ${item.quantity}`,
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await salesService.create({
        customerId,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: Number(i.quantity),
          sellingPrice: Number(i.sellingPrice),
          discount: Number(i.discount || 0),
          taxPercentage: Number(i.taxPercentage || 0),
        })),
        discount: Number(discount || 0),
        paidAmount: Number(paidAmount || 0),
        paymentMethod,
        notes,
      });

      router.push('/sales');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <PageHeader
        title="Create Sales Invoice (POS)"
        description="Issue an authoritative timber sale invoice and automatically decrement stock."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Sales', href: '/sales' },
          { label: 'New Invoice' },
        ]}
        action={
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
        }
      />

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Payment Meta */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            1. Customer & Sale Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Select Customer <span className="text-rose-500">*</span>
              </label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              >
                <option value="">-- Choose Customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.company ? `(${c.company})` : ''} — Balance Due:{' '}
                    {formatCurrency(c.totalDue || 0)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-red-600"
              >
                <option value="CASH">CASH</option>
                <option value="BANK_TRANSFER">BANK TRANSFER / NEFT</option>
                <option value="UPI">UPI</option>
                <option value="CHEQUE">CHEQUE</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Line Items Table */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              2. Order Line Items
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItemRow}
              className="gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" /> Add Product Row
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-2 min-w-[220px]">Product / Material</th>
                  <th className="p-2 w-24">Stock</th>
                  <th className="p-2 w-24">Qty</th>
                  <th className="p-2 w-32">Unit Price (₹)</th>
                  <th className="p-2 w-24">Disc %</th>
                  <th className="p-2 w-24">Tax %</th>
                  <th className="p-2 w-32 text-right">Line Total</th>
                  <th className="p-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item, idx) => {
                  const prod = item.product;
                  const isStockWarning =
                    prod && item.quantity > prod.currentStock;

                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-2">
                        <select
                          value={item.productId}
                          onChange={(e) => handleProductChange(idx, e.target.value)}
                          required
                          className="w-full px-2 py-1.5 text-xs rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        >
                          <option value="">-- Choose Product --</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.woodType} / {p.grade}) — Stock: {p.currentStock} {p.unit}
                            </option>
                          ))}
                        </select>
                        {prod && (
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            SKU: {prod.sku} | Spec: {prod.thickness}x{prod.width}x{prod.length}mm
                          </span>
                        )}
                      </td>
                      <td className="p-2">
                        {prod ? (
                          <span
                            className={`font-semibold ${
                              isStockWarning ? 'text-rose-600' : 'text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {prod.currentStock} {prod.unit}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                          className="h-8 text-xs w-20"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          step="any"
                          value={item.sellingPrice}
                          onChange={(e) =>
                            handlePriceChange(idx, Number(e.target.value))
                          }
                          className="h-8 text-xs w-28"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) =>
                            handleLineDiscountChange(idx, Number(e.target.value))
                          }
                          className="h-8 text-xs w-16"
                        />
                      </td>
                      <td className="p-2">
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.taxPercentage}%
                        </span>
                      </td>
                      <td className="p-2 text-right font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(lineSubtotals[idx]?.total || 0)}
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          disabled={items.length <= 1}
                          className="text-slate-400 hover:text-rose-600 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Invoice Summary & Checkout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Notes & Remarks
            </h3>
            <textarea
              rows={4}
              placeholder="Delivery terms, dispatch vehicle number, customer remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-red-600 focus:outline-hidden"
            />
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 border-b pb-2">
              Financial Summary
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Items Gross Subtotal</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {totalLineDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Line Items Discount</span>
                  <span>-{formatCurrency(totalLineDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Estimated Tax (GST)</span>
                <span className="font-semibold">+{formatCurrency(totalTax)}</span>
              </div>
              <div className="flex items-center justify-between gap-4 pt-1">
                <span className="text-slate-600 dark:text-slate-400">Overall Discount (₹)</span>
                <Input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-8 text-xs w-32 text-right"
                />
              </div>

              <div className="border-t pt-2 flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100">
                <span>Grand Total</span>
                <span className="text-red-600 dark:text-red-400 text-base">
                  {formatCurrency(grandTotal)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Immediate Paid Amount (₹)
                </span>
                <Input
                  type="number"
                  min="0"
                  max={grandTotal}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="h-8 text-xs w-32 text-right font-bold text-emerald-600"
                />
              </div>

              <div className="flex justify-between text-xs font-semibold pt-1 border-t">
                <span className="text-slate-600 dark:text-slate-400">Balance Due</span>
                <span className={dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {formatCurrency(dueAmount)}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full gap-2 mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5"
            >
              {isSubmitting ? (
                'Processing Sale...'
              ) : (
                <>
                  <Check className="h-4 w-4" /> Finalize & Issue Sale Invoice
                </>
              )}
            </Button>
          </Card>
        </div>
      </form>
    </div>
  );
}
