'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, Plus, Trash2, Check, AlertCircle, ShieldAlert } from 'lucide-react';
import { roleService } from '../../../services/role.service';
import { PageHeader } from '../../../components/common/page-header';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { Role } from '../../../types';

const permissionGroups: Record<string, { label: string; perms: string[] }> = {
  Dashboard: {
    label: 'Dashboard & KPIs',
    perms: [PERMISSIONS.DASHBOARD_VIEW],
  },
  Products: {
    label: 'Products & Timber Specs',
    perms: [
      PERMISSIONS.PRODUCTS_VIEW,
      PERMISSIONS.PRODUCTS_CREATE,
      PERMISSIONS.PRODUCTS_UPDATE,
      PERMISSIONS.PRODUCTS_DELETE,
    ],
  },
  Categories: {
    label: 'Categories',
    perms: [
      PERMISSIONS.CATEGORIES_VIEW,
      PERMISSIONS.CATEGORIES_CREATE,
      PERMISSIONS.CATEGORIES_UPDATE,
      PERMISSIONS.CATEGORIES_DELETE,
    ],
  },
  Inventory: {
    label: 'Inventory & Stock Control',
    perms: [
      PERMISSIONS.INVENTORY_VIEW,
      PERMISSIONS.INVENTORY_ADJUST,
      PERMISSIONS.INVENTORY_RESET,
      PERMISSIONS.INVENTORY_HISTORY,
    ],
  },
  Sales: {
    label: 'Sales & POS Invoicing',
    perms: [
      PERMISSIONS.SALES_VIEW,
      PERMISSIONS.SALES_CREATE,
      PERMISSIONS.SALES_CANCEL,
    ],
  },
  Purchases: {
    label: 'Purchases & Procurement',
    perms: [
      PERMISSIONS.PURCHASES_VIEW,
      PERMISSIONS.PURCHASES_CREATE,
    ],
  },
  Customers: {
    label: 'Customer Accounts',
    perms: [
      PERMISSIONS.CUSTOMERS_VIEW,
      PERMISSIONS.CUSTOMERS_CREATE,
      PERMISSIONS.CUSTOMERS_UPDATE,
      PERMISSIONS.CUSTOMERS_DELETE,
    ],
  },
  Suppliers: {
    label: 'Supplier Accounts',
    perms: [
      PERMISSIONS.SUPPLIERS_VIEW,
      PERMISSIONS.SUPPLIERS_CREATE,
      PERMISSIONS.SUPPLIERS_UPDATE,
      PERMISSIONS.SUPPLIERS_DELETE,
    ],
  },
  Payments: {
    label: 'Payments & Cash In/Out',
    perms: [
      PERMISSIONS.PAYMENTS_VIEW,
      PERMISSIONS.PAYMENTS_CREATE,
    ],
  },
  Expenses: {
    label: 'Operational Expenses',
    perms: [
      PERMISSIONS.EXPENSES_VIEW,
      PERMISSIONS.EXPENSES_CREATE,
      PERMISSIONS.EXPENSES_DELETE,
    ],
  },
  Reports: {
    label: 'Reports & P&L Statements',
    perms: [PERMISSIONS.REPORTS_VIEW],
  },
  Users: {
    label: 'User Administration',
    perms: [
      PERMISSIONS.USERS_VIEW,
      PERMISSIONS.USERS_CREATE,
      PERMISSIONS.USERS_UPDATE,
      PERMISSIONS.USERS_DELETE,
    ],
  },
  Roles: {
    label: 'Roles & Permissions Matrix',
    perms: [
      PERMISSIONS.ROLES_VIEW,
      PERMISSIONS.ROLES_CREATE,
      PERMISSIONS.ROLES_UPDATE,
      PERMISSIONS.ROLES_DELETE,
    ],
  },
  Audit: {
    label: 'Security & Audit Logs',
    perms: [PERMISSIONS.AUDIT_VIEW],
  },
  Settings: {
    label: 'Business Settings',
    perms: [
      PERMISSIONS.SETTINGS_VIEW,
      PERMISSIONS.SETTINGS_UPDATE,
    ],
  },
};

export default function RolesPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.findAll(),
  });

  const roles: Role[] = (data as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => roleService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create role.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => roleService.delete(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      if (selectedRole?._id === variables) {
        setSelectedRole(null);
      }
    },
  });

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setFormError('');
  };

  const handleTogglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter((p) => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  const handleToggleGroup = (perms: string[]) => {
    const allSelected = perms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions(
        selectedPermissions.filter((p) => !perms.includes(p)),
      );
    } else {
      const merged = Array.from(new Set([...selectedPermissions, ...perms]));
      setSelectedPermissions(merged);
    }
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('Please enter a role name.');
      return;
    }
    if (selectedPermissions.length === 0) {
      setFormError('Please assign at least one permission.');
      return;
    }

    createMutation.mutate({
      name: name.toUpperCase().replace(/\s+/g, '_'),
      description,
      permissions: selectedPermissions,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Roles & Access Control (RBAC)"
        description="Configure fine-grained permission matrices for staff, managers, and custom roles."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Roles' },
        ]}
        action={
          hasPermission(PERMISSIONS.ROLES_CREATE) ? (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Custom Role
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="space-y-3 lg:col-span-1">
          {isLoading ? (
            <div className="p-4 text-xs text-slate-400">Loading roles...</div>
          ) : (
            roles.map((r) => {
              const isSelected =
                (selectedRole?._id || roles[0]?._id) === r._id;
              const currentActive = selectedRole || roles[0];

              return (
                <div
                  key={r._id}
                  onClick={() => setSelectedRole(r)}
                  className={`p-4 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'border-red-600 bg-red-50/50 dark:bg-red-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {r.name}
                        </h4>
                        {r.isSystem && (
                          <Badge variant="secondary" className="text-[9px]">
                            SYSTEM
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {r.description || 'Custom business role'}
                      </p>
                    </div>

                    {!r.isSystem && hasPermission(PERMISSIONS.ROLES_DELETE) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(`Delete custom role "${r.name}"?`)
                          ) {
                            deleteMutation.mutate(r._id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>{r.permissions?.length || 0} permissions granted</span>
                    <span className="text-red-600 font-semibold text-[11px]">
                      View Matrix →
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Role Permission Matrix View */}
        <div className="lg:col-span-2">
          {(() => {
            const active = selectedRole || roles[0];
            if (!active) return null;

            return (
              <Card className="p-6 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {active.name} Permissions
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {active.description}
                      </p>
                    </div>
                    <Badge variant={active.isSystem ? 'default' : 'secondary'}>
                      {active.permissions?.length} Permissions
                    </Badge>
                  </div>
                </div>

                {/* Grouped Permission Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(permissionGroups).map(([groupKey, grp]) => {
                    const grantedInGroup = grp.perms.filter((p) =>
                      active.permissions?.includes(p),
                    );

                    return (
                      <div
                        key={groupKey}
                        className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {grp.label}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {grantedInGroup.length} / {grp.perms.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {grp.perms.map((p) => {
                            const isGranted =
                              active.permissions?.includes(p);
                            return (
                              <span
                                key={p}
                                className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                                  isGranted
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800/60 line-through opacity-50'
                                }`}
                              >
                                {p.split('.')[1] || p}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })()}
        </div>
      </div>

      {/* Create Custom Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create Custom ERP Role
            </h3>

            {formError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Role Code / Name <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. INVENTORY_CLERK"
                    required
                    className="text-xs uppercase"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Description
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Can manage wood stock and log entries"
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Permission Matrix Checkboxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                    Grant Permissions ({selectedPermissions.length} selected)
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const allPerms = Object.values(permissionGroups).flatMap(
                          (g) => g.perms,
                        );
                        setSelectedPermissions(allPerms);
                      }}
                      className="text-[11px] text-red-600 font-semibold hover:underline"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPermissions([])}
                      className="text-[11px] text-slate-500 hover:underline"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(permissionGroups).map(([groupKey, grp]) => {
                    const allSelected = grp.perms.every((p) =>
                      selectedPermissions.includes(p),
                    );

                    return (
                      <div
                        key={groupKey}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-800/20"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {grp.label}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleGroup(grp.perms)}
                            className="text-[11px] text-slate-500 hover:text-red-600"
                          >
                            {allSelected ? 'Uncheck All' : 'Check All'}
                          </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {grp.perms.map((perm) => {
                            const checked =
                              selectedPermissions.includes(perm);
                            return (
                              <label
                                key={perm}
                                className="flex items-center gap-2 text-[11px] cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => handleTogglePermission(perm)}
                                  className="rounded text-red-600 focus:ring-red-600"
                                />
                                <span className={checked ? 'font-semibold text-slate-900 dark:text-slate-100' : 'text-slate-500'}>
                                  {perm.split('.')[1] || perm}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createMutation.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white gap-1.5"
                >
                  {createMutation.isPending ? (
                    'Creating...'
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" /> Save Role
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
