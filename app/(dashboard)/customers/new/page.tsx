'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { customerService } from '../../../../services/customer.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';

export default function NewCustomerPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    customerCode: '',
    phone: '',
    email: '',
    company: '',
    address: '',
    city: 'Ahmedabad',
    state: 'Gujarat',
    country: 'India',
    postalCode: '',
    customerType: 'Furniture Manufacturer',
    taxNumber: '',
    creditLimit: 100000,
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: any) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      router.push('/customers');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create customer');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Customer"
        description="Add a new timber client, commercial furniture studio, or contractor."
        actions={
          <a href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          </a>
        }
      />

      {error && (
        <div className="p-3 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Customer & Commercial Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Contact Person Name *"
              required
              placeholder="e.g. Ramesh Patel"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="Company / Enterprise Name"
              placeholder="e.g. Patel Woodcraft & Interiors"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
            />
            <Input
              label="Customer Code (Optional)"
              placeholder="Auto-generated if blank (e.g. CUST-0004)"
              value={formData.customerCode}
              onChange={(e) => handleChange('customerCode', e.target.value)}
            />
            <Input
              label="Phone Number *"
              required
              placeholder="+91 98250 00000"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="orders@company.example"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <Select
              label="Customer Type"
              value={formData.customerType}
              onChange={(e) => handleChange('customerType', e.target.value)}
            >
              <option value="Furniture Manufacturer">Furniture Manufacturer</option>
              <option value="Wholesale Buyer">Wholesale Buyer</option>
              <option value="Architect / Interior Studio">Architect / Interior Studio</option>
              <option value="Building Contractor">Building Contractor</option>
              <option value="Retail Walk-in">Retail Walk-in</option>
            </Select>
            <Input
              label="GSTIN / Tax Number"
              placeholder="24AAAAA0000A1Z5"
              value={formData.taxNumber}
              onChange={(e) => handleChange('taxNumber', e.target.value)}
            />
            <Input
              label="Credit Limit (₹)"
              type="number"
              value={formData.creditLimit}
              onChange={(e) => handleChange('creditLimit', Number(e.target.value))}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Address & Delivery Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Input
                label="Street Address"
                placeholder="Factory plot, industrial area..."
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
            <Input
              label="State"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
            <Input
              label="Postal Code"
              value={formData.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
            />
            <Input
              label="Internal Notes"
              placeholder="Special delivery instructions, wood preferences..."
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <a href="/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </a>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white"
            isLoading={createMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Register Customer
          </Button>
        </div>
      </form>
    </div>
  );
}
