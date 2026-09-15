'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { customerService } from '../../../../services/customer.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';

const PRESET_CUSTOMER_TYPES = [
  'Furniture Manufacturer',
  'Wholesale Buyer',
  'Architect / Interior Studio',
  'Building Contractor',
  'Retail Walk-in',
];

const OTHER_TYPE_VALUE = '__other__';

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
    notes: '',
  });
  const [selectedType, setSelectedType] = useState('Furniture Manufacturer');
  const [customType, setCustomType] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: customersData } = useQuery({
    queryKey: ['all-customers'],
    queryFn: () => customerService.findAll(),
  });

  const extraTypes = useMemo(() => {
    const existing = ((customersData as any)?.data || [])
      .map((customer: { customerType?: string }) => customer.customerType)
      .filter(Boolean) as string[];

    return Array.from(new Set(existing)).filter(
      (type) => !PRESET_CUSTOMER_TYPES.includes(type) && type !== 'Other',
    );
  }, [customersData]);

  const createMutation = useMutation({
    mutationFn: (data: any) => customerService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['all-customers'] });
      router.push('/customers');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create customer');
    },
  });

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    if (value === OTHER_TYPE_VALUE) {
      handleChange('customerType', customType.trim());
      return;
    }
    handleChange('customerType', value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const customerType =
      selectedType === OTHER_TYPE_VALUE
        ? customType.trim()
        : selectedType.trim();

    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Contact person name and phone number are required.');
      return;
    }

    if (!customerType) {
      setError('Please select a customer type, or enter a new type.');
      return;
    }

    createMutation.mutate({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      company: formData.company.trim() || undefined,
      customerCode: formData.customerCode.trim() || undefined,
      email: formData.email.trim() || undefined,
      taxNumber: formData.taxNumber.trim() || undefined,
      customerType,
      address: formData.address.trim() || undefined,
      city: formData.city.trim() || undefined,
      state: formData.state.trim() || undefined,
      country: formData.country.trim() || undefined,
      postalCode: formData.postalCode.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Register New Customer"
        description="Add a new timber client, commercial furniture studio, or contractor."
        actions={
          <Link href="/customers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Cancel
            </Button>
          </Link>
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
              label="Email Address (Optional)"
              type="email"
              placeholder="orders@company.example"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
            />
            <div className="space-y-2">
              <Select
                label="Customer Type"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {PRESET_CUSTOMER_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                {extraTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
                <option value={OTHER_TYPE_VALUE}>Other (enter new type)</option>
              </Select>
              {selectedType === OTHER_TYPE_VALUE && (
                <Input
                  label="New Customer Type *"
                  placeholder="e.g. Exporter, Government, Hotel Project"
                  value={customType}
                  onChange={(e) => {
                    setCustomType(e.target.value);
                    handleChange('customerType', e.target.value);
                  }}
                />
              )}
            </div>
            <Input
              label="GSTIN / Tax Number (Optional)"
              placeholder="24AAAAA0000A1Z5"
              value={formData.taxNumber}
              onChange={(e) => handleChange('taxNumber', e.target.value)}
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
          <Link href="/customers">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
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
