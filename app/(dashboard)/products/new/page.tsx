'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { productService } from '../../../../services/product.service';
import { categoryService } from '../../../../services/category.service';
import { PageHeader } from '../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Button } from '../../../../components/ui/button';
import { Select } from '../../../../components/ui/select';

export default function NewProductPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    categoryId: '',
    description: '',
    woodType: 'Teak',
    grade: 'A-Grade',
    quality: 'Premium Export',
    thickness: 50,
    width: 150,
    length: 2400,
    unit: 'cft',
    color: 'Golden Brown',
    finish: 'Rough Sawn',
    brand: 'Generic',
    purchasePrice: 400,
    sellingPrice: 600,
    wholesalePrice: 550,
    taxPercentage: 18,
    openingStock: 50,
    minimumStock: 10,
    maximumStock: 500,
    location: 'Yard A - Bay 1',
    status: 'ACTIVE',
    notes: '',
  });

  const [error, setError] = useState<string | null>(null);

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.findAll(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      router.push('/products');
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create product');
    },
  });

  const categoryList: any[] = Array.isArray(categoriesRes?.data)
    ? categoriesRes.data
    : Array.isArray((categoriesRes as any)?.data?.data)
    ? (categoriesRes as any).data.data
    : Array.isArray(categoriesRes)
    ? (categoriesRes as any)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!formData.categoryId) {
      setError('Please select a category');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Add New Wood / Timber Material"
        description="Register a new wood specification, timber log, board, or plywood to the inventory."
        actions={
          <a href="/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Products
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
        {/* Section 1: Basic Identifiers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              1. Basic Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Product Name *"
              required
              placeholder="e.g. Burma Teak Timber Log"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="SKU Code *"
              required
              placeholder="e.g. TEAK-BUR-001"
              value={formData.sku}
              onChange={(e) => handleChange('sku', e.target.value)}
            />
            <Select
              label="Category *"
              required
              value={formData.categoryId}
              onChange={(e) => handleChange('categoryId', e.target.value)}
            >
              <option value="">Select Category</option>
              {categoryList.map((cat: any) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </Select>

            <Input
              label="Barcode / Tag"
              placeholder="e.g. 8901234567890"
              value={formData.barcode}
              onChange={(e) => handleChange('barcode', e.target.value)}
            />
            <div className="md:col-span-2">
              <Input
                label="Description"
                placeholder="Grade details, provenance, seasoning..."
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Wood Attributes & Physical Specs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              2. Wood & Lumber Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Wood Species / Type"
              placeholder="e.g. Teak, Pine, Oak, Walnut"
              value={formData.woodType}
              onChange={(e) => handleChange('woodType', e.target.value)}
            />
            <Input
              label="Lumber Grade"
              placeholder="e.g. A-Grade, FAS, Select"
              value={formData.grade}
              onChange={(e) => handleChange('grade', e.target.value)}
            />
            <Input
              label="Quality Tier"
              placeholder="e.g. Export, Premium, Commercial"
              value={formData.quality}
              onChange={(e) => handleChange('quality', e.target.value)}
            />
            <Select
              label="Stock Measurement Unit"
              value={formData.unit}
              onChange={(e) => handleChange('unit', e.target.value)}
            >
              <option value="cft">Cubic Feet (cft)</option>
              <option value="sqft">Square Feet (sqft)</option>
              <option value="piece">Piece / Sheet (piece)</option>
              <option value="bundle">Bundle</option>
              <option value="log">Log</option>
            </Select>

            <Input
              label="Thickness (mm)"
              type="number"
              value={formData.thickness}
              onChange={(e) => handleChange('thickness', Number(e.target.value))}
            />
            <Input
              label="Width (mm)"
              type="number"
              value={formData.width}
              onChange={(e) => handleChange('width', Number(e.target.value))}
            />
            <Input
              label="Length (mm)"
              type="number"
              value={formData.length}
              onChange={(e) => handleChange('length', Number(e.target.value))}
            />
            <Input
              label="Finish"
              placeholder="Rough Sawn, Planed S4S, Sanded"
              value={formData.finish}
              onChange={(e) => handleChange('finish', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Section 3: Pricing & Taxation */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Commercial Pricing & Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Purchase / Cost Price (₹) *"
              type="number"
              required
              value={formData.purchasePrice}
              onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
            />
            <Input
              label="Retail Selling Price (₹) *"
              type="number"
              required
              value={formData.sellingPrice}
              onChange={(e) => handleChange('sellingPrice', Number(e.target.value))}
            />
            <Input
              label="Wholesale Price (₹)"
              type="number"
              value={formData.wholesalePrice}
              onChange={(e) => handleChange('wholesalePrice', Number(e.target.value))}
            />
            <Input
              label="GST Tax Rate (%)"
              type="number"
              value={formData.taxPercentage}
              onChange={(e) => handleChange('taxPercentage', Number(e.target.value))}
            />
          </CardContent>
        </Card>

        {/* Section 4: Initial Inventory & Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              4. Inventory Baseline & Storage Location
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Opening Stock Count"
              type="number"
              value={formData.openingStock}
              onChange={(e) => handleChange('openingStock', Number(e.target.value))}
            />
            <Input
              label="Minimum Stock (Alert Level)"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => handleChange('minimumStock', Number(e.target.value))}
            />
            <Input
              label="Maximum Stock Capacity"
              type="number"
              value={formData.maximumStock}
              onChange={(e) => handleChange('maximumStock', Number(e.target.value))}
            />
            <Input
              label="Yard / Shed Location"
              placeholder="e.g. Yard A - Bay 1"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex items-center justify-end gap-3">
          <a href="/products">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </a>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
            isLoading={createMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Register Material
          </Button>
        </div>
      </form>
    </div>
  );
}
