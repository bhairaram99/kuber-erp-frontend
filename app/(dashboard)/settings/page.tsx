'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Check, AlertCircle } from 'lucide-react';
import { settingService } from '../../../services/setting.service';
import { PageHeader } from '../../../components/common/page-header';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Setting } from '../../../types';

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [formData, setFormData] = useState<Partial<Setting>>({});
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingService.getSettings(),
  });

  useEffect(() => {
    if (data?.data) {
      setFormData(data.data);
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Setting>) =>
      settingService.updateSettings(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update settings.');
    },
  });

  const handleChange = (field: keyof Setting, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading business configuration...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Business Configuration & Settings"
        description="Configure enterprise timber business parameters, tax numbers, and system policies."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4" />
          <span>Business settings updated successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
            Company & Tax Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Business Name
              </label>
              <Input
                value={formData.businessName || ''}
                onChange={(e) => handleChange('businessName', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                GSTIN / Tax Registration Number
              </label>
              <Input
                value={formData.taxNumber || ''}
                onChange={(e) => handleChange('taxNumber', e.target.value)}
                className="text-xs uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Official Business Email
              </label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Contact Phone
              </label>
              <Input
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Yard & Sawmill Address
              </label>
              <Input
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Currency & Document Prefixes */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
            Currency & Invoicing
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Currency Code
              </label>
              <Input
                value={formData.currency || 'INR'}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="text-xs uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Currency Symbol
              </label>
              <Input
                value={formData.currencySymbol || '₹'}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Timezone
              </label>
              <Input
                value={formData.timezone || 'Asia/Kolkata'}
                onChange={(e) => handleChange('timezone', e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Sales Invoice Prefix
              </label>
              <Input
                value={formData.invoicePrefix || 'INV-'}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                className="text-xs uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Purchase Order Prefix
              </label>
              <Input
                value={formData.purchasePrefix || 'PO-'}
                onChange={(e) => handleChange('purchasePrefix', e.target.value)}
                className="text-xs uppercase"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Max Allowed Discount %
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.maxDiscountPercentage || 25}
                onChange={(e) =>
                  handleChange('maxDiscountPercentage', Number(e.target.value))
                }
                className="text-xs"
              />
            </div>
          </div>
        </Card>

        {/* Inventory Rules */}
        <Card className="p-6 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 border-b pb-2">
            Inventory & Stock Policies
          </h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                Default Low Stock Alert Threshold
              </label>
              <Input
                type="number"
                min="1"
                value={formData.lowStockThreshold || 10}
                onChange={(e) =>
                  handleChange('lowStockThreshold', Number(e.target.value))
                }
                className="text-xs w-48"
              />
            </div>

            <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={formData.allowNegativeStock || false}
                onChange={(e) =>
                  handleChange('allowNegativeStock', e.target.checked)
                }
                className="rounded text-red-600 focus:ring-red-600"
              />
              <span>
                <strong>Allow Negative Stock:</strong> Permit sales even when
                physical timber inventory is recorded as zero (Dangerous).
              </span>
            </label>

            <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requireStockAdjustmentReason ?? true}
                onChange={(e) =>
                  handleChange(
                    'requireStockAdjustmentReason',
                    e.target.checked,
                  )
                }
                className="rounded text-red-600 focus:ring-red-600"
              />
              <span>
                <strong>Mandatory Adjustment Reason:</strong> Require staff to
                specify reason (e.g. shrinkage, damage, saw wastage) on every
                manual adjustment.
              </span>
            </label>
          </div>
        </Card>

        {hasPermission(PERMISSIONS.SETTINGS_UPDATE) && (
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Save className="h-4 w-4" />
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
