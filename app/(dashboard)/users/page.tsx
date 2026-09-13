'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCheck, Plus, Trash2, Search, Check, AlertCircle, Shield } from 'lucide-react';
import { userService } from '../../../services/user.service';
import { roleService } from '../../../services/role.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { formatDateTime } from '../../../lib/utils';
import { useAuth } from '../../../providers/auth-provider';
import { PERMISSIONS } from '../../../lib/permissions';
import { User, Role } from '../../../types';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [formError, setFormError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, limit, search],
    queryFn: () => userService.findPaginated({ page, limit, search }),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => roleService.findAll(),
  });

  const roles: Role[] = (rolesData as any)?.data || [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => userService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create user.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setRoleId('');
    setStatus('ACTIVE');
    setFormError('');
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !roleId) {
      setFormError('Please fill all required fields.');
      return;
    }

    createMutation.mutate({
      name,
      email,
      password,
      phone,
      roleId,
      status,
    });
  };

  const columns = [
    {
      header: 'Staff Member',
      accessorKey: 'name',
      cell: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-red-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
              {row.name}
            </p>
            <p className="text-[11px] text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Assigned Role',
      accessorKey: 'role',
      cell: (row: User) => {
        const role = row.role as any;
        return (
          <Badge
            variant={
              role?.name === 'SUPER_ADMIN'
                ? 'destructive'
                : role?.name === 'MANAGER'
                ? 'default'
                : 'secondary'
            }
            className="text-[10px]"
          >
            {role?.name || 'STAFF'}
          </Badge>
        );
      },
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row: User) => (
        <span className="text-xs text-slate-500">{row.phone || '-'}</span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row: User) => (
        <Badge
          variant={row.status === 'ACTIVE' ? 'success' : 'destructive'}
          className="text-[10px]"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      accessorKey: 'lastLoginAt',
      cell: (row: User) => (
        <span className="text-xs text-slate-500">
          {row.lastLoginAt ? formatDateTime(row.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessorKey: '_id',
      cell: (row: User) => {
        const id = (row as any)._id || (row as any).id;
        const roleName = (row.role as any)?.name;
        if (roleName === 'SUPER_ADMIN') return null;

        return hasPermission(PERMISSIONS.USERS_DELETE) ? (
          <button
            onClick={() => {
              if (window.confirm(`Delete user account "${row.name}"?`)) {
                deleteMutation.mutate(id);
              }
            }}
            className="text-slate-400 hover:text-rose-600 p-1"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage employee accounts, role assignments, and authentication status."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Users' },
        ]}
        action={
          hasPermission(PERMISSIONS.USERS_CREATE) ? (
            <Button onClick={() => setIsModalOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Add User Account
            </Button>
          ) : undefined
        }
      />

      {/* Search */}
      <div className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        pagination={data?.pagination}
        onPageChange={setPage}
        onLimitChange={(lim) => {
          setLimit(lim);
          setPage(1);
        }}
        emptyMessage="No users found."
      />

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Create New Employee User
            </h3>

            {formError && (
              <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ramesh Patel"
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh@wooderp.com"
                  required
                  className="text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Password <span className="text-rose-500">*</span>
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Phone
                  </label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                    Assigned Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    <option value="">-- Choose Role --</option>
                    {roles.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
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
                      <Check className="h-3.5 w-3.5" /> Save User Account
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
