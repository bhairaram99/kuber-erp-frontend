'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Eye, Truck } from 'lucide-react';
import { supplierService } from '../../../services/supplier.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Supplier } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    supplierCode: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    taxNumber: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: suppliersRes, isLoading } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => supplierService.findPaginated({ page, limit: 15, search: search || undefined }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create supplier');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      supplierCode: '',
      phone: '',
      email: '',
      company: '',
      address: '',
      taxNumber: '',
      notes: '',
    });
    setError(null);
  };

  const columns: Column<Supplier>[] = [
    {
      header: 'Supplier & Code',
      cell: (row) => (
        <div>
          <Link
            href={`/suppliers/${row._id}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-red-600 transition"
          >
            {row.name}
          </Link>
          <p className="text-xs text-slate-500 font-mono">{row.supplierCode}</p>
        </div>
      ),
    },
    {
      header: 'Company & Contact',
      cell: (row) => (
        <div>
          <p className="text-xs font-medium text-slate-800 dark:text-slate-200">{row.company}</p>
          <p className="text-[11px] text-slate-500">
            {row.phone} • {row.email}
          </p>
        </div>
      ),
    },
    {
      header: 'Total Procurements',
      cell: (row) => (
        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
          {formatCurrency(row.totalPurchases)}
        </span>
      ),
    },
    {
      header: 'Paid to Supplier',
      cell: (row) => (
        <span className="font-bold text-xs text-emerald-600">
          {formatCurrency(row.totalPaid)}
        </span>
      ),
    },
    {
      header: 'Payable Due',
      cell: (row) => {
        const isDue = (row.totalDue || 0) > 0;
        return (
          <span className={`font-black text-xs ${isDue ? 'text-red-600' : 'text-slate-400'}`}>
            {formatCurrency(row.totalDue)}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Link href={`/suppliers/${row._id}`}>
          <Button variant="outline" size="sm">
            <Eye className="w-3.5 h-3.5 mr-1" /> Orders
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timber Suppliers & Importers"
        description="Manage log vendors, sawmills, and international lumber import suppliers."
        actions={
          <PermissionGuard permission={PERMISSIONS.SUPPLIERS_CREATE}>
            <Button
              onClick={() => {
                resetForm();
                setIsModalOpen(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Register Supplier
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={suppliersRes?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Search supplier name, company, code, phone..."
        searchValue={search}
        onSearchChange={setSearch}
        pagination={suppliersRes?.pagination}
        onPageChange={setPage}
      />

      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Lumber Supplier"
        description="Record vendor information for purchase orders and accounts payable."
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createMutation.mutate(formData);
          }}
          className="space-y-4"
        >
          <Input
            label="Supplier Contact Name *"
            required
            placeholder="e.g. Nilesh Shah"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input
            label="Trading Company Name *"
            required
            placeholder="e.g. Gujarat Timber Traders LLP"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone Number *"
              required
              placeholder="+91 98251 00000"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="sales@vendor.example"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <Input
            label="Yard / Depot Address"
            placeholder="Timber Yard, Port Road..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          <Input
            label="Tax / GSTIN Number"
            placeholder="24BBBBB1111B1Z2"
            value={formData.taxNumber}
            onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              isLoading={createMutation.isPending}
            >
              Register Supplier
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
