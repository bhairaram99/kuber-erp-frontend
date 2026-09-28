'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { productService } from '../../../../../services/product.service';
import { categoryService } from '../../../../../services/category.service';
import { PageHeader } from '../../../../../components/common/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Input } from '../../../../../components/ui/input';
import { Button } from '../../../../../components/ui/button';
import { Select } from '../../../../../components/ui/select';

export default function EditProductPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<any>(null);
  const [useDimensions, setUseDimensions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: productRes, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productService.findById(id),
    enabled: !!id,
  });

  const { data: categoriesRes } = useQuery({
    queryKey: ['categories-all'],
    queryFn: () => categoryService.findAll(),
  });

  useEffect(() => {
    if (productRes?.data) {
      const p = productRes.data;
      setFormData({
        name: p.name,
        sku: p.sku,
        barcode: p.barcode || '',
        categoryId: (p.categoryId as any)?._id || p.categoryId,
        description: p.description || '',
        woodType: p.woodType,
        grade: p.grade,
        quality: p.quality,
        thickness: p.thickness,
        width: p.width,
        length: p.length,
        unit: p.unit,
        color: p.color || '',
        finish: p.finish,
        brand: p.brand,
        purchasePrice: p.purchasePrice,
        sellingPrice: p.sellingPrice,
        wholesalePrice: p.wholesalePrice || 0,
        taxPercentage: p.taxPercentage,
        minimumStock: p.minimumStock,
        maximumStock: p.maximumStock,
        location: p.location,
        status: p.status,
        notes: p.notes || '',
      });
      setUseDimensions([p.thickness, p.width, p.length].some((value) => Number(value) > 0));
    }
  }, [productRes]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => productService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
      router.push(`/products/${id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to update product');
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
    if (useDimensions && (!formData.thickness || !formData.width || !formData.length)) {
      setError('Enter thickness, width, and length, or turn dimensions off.');
      return;
    }
    updateMutation.mutate({
      ...formData,
      thickness: useDimensions ? Number(formData.thickness) : 0,
      width: useDimensions ? Number(formData.width) : 0,
      length: useDimensions ? Number(formData.length) : 0,
    });
  };

  const handleChange = (field: string, val: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: val }));
  };

  if (isLoading || !formData) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading product...</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit Material: ${formData.name}`}
        description="Update specifications, prices, or storage locations."
        actions={
          <a href={`/products/${id}`}>
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
              1. Basic Identification
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Product Name *"
              required
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
            <Input
              label="SKU Code *"
              required
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
              label="Company Name"
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              2. Commercial Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Input
              label="Purchase / Cost (₹) *"
              type="number"
              required
              value={formData.purchasePrice}
              onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
            />
            <Input
              label="Selling Price (₹) *"
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              3. Inventory Thresholds & Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-3 py-2.5 dark:border-slate-800">
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Dimensions</p>
                <p className="text-[11px] text-slate-500">Turn on to record thickness, width, and length for this product.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={useDimensions}
                onClick={() => setUseDimensions((current) => !current)}
                className={`relative h-6 w-11 shrink-0 rounded-full transition ${
                  useDimensions ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    useDimensions ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
            {useDimensions && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Input
                  label="Thickness (mm) *"
                  type="number"
                  min="0"
                  required
                  value={formData.thickness || ''}
                  onChange={(e) => handleChange('thickness', Number(e.target.value))}
                />
                <Input
                  label="Width (mm) *"
                  type="number"
                  min="0"
                  required
                  value={formData.width || ''}
                  onChange={(e) => handleChange('width', Number(e.target.value))}
                />
                <Input
                  label="Length (mm) *"
                  type="number"
                  min="0"
                  required
                  value={formData.length || ''}
                  onChange={(e) => handleChange('length', Number(e.target.value))}
                />
                <Select
                  label="Unit *"
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                >
                  <option value="cft">CFT</option>
                  <option value="sqft">SQFT</option>
                  <option value="piece">Piece</option>
                  <option value="sheet">Sheet</option>
                  <option value="bundle">Bundle</option>
                  <option value="kg">KG</option>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Input
              label="Minimum Stock"
              type="number"
              value={formData.minimumStock}
              onChange={(e) => handleChange('minimumStock', Number(e.target.value))}
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <a href={`/products/${id}`}>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </a>
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white font-medium"
            isLoading={updateMutation.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
