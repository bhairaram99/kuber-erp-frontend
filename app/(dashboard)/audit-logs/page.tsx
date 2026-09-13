'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ScrollText, Search, Eye, ChevronDown, ChevronRight } from 'lucide-react';
import { auditLogService } from '../../../services/setting.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable } from '../../../components/common/data-table';
import { Badge } from '../../../components/ui/badge';
import { formatDateTime } from '../../../lib/utils';
import { AuditLog } from '../../../types';

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [module, setModule] = useState('');
  const [action, setAction] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, limit, module, action],
    queryFn: () =>
      auditLogService.findPaginated({
        page,
        limit,
        module: module || undefined,
        action: action || undefined,
      }),
  });

  const getActionVariant = (act: string) => {
    if (act.includes('CREATE') || act.includes('INFLOW')) return 'success';
    if (act.includes('DELETE') || act.includes('CANCEL') || act.includes('RESET'))
      return 'destructive';
    if (act.includes('UPDATE') || act.includes('ADJUST')) return 'warning';
    return 'default';
  };

  const columns = [
    {
      header: 'Timestamp',
      accessorKey: 'createdAt',
      cell: (row: AuditLog) => (
        <span className="text-xs text-slate-500 whitespace-nowrap">
          {formatDateTime(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'User',
      accessorKey: 'userId',
      cell: (row: AuditLog) => (
        <div>
          <p className="font-semibold text-xs text-slate-900 dark:text-slate-100">
            {row.userId?.name || 'System Auto'}
          </p>
          {row.userId?.email && (
            <p className="text-[10px] text-slate-400">{row.userId.email}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Module',
      accessorKey: 'module',
      cell: (row: AuditLog) => (
        <Badge variant="outline" className="text-[10px] uppercase">
          {row.module}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: (row: AuditLog) => (
        <Badge variant={getActionVariant(row.action)} className="text-[10px]">
          {row.action}
        </Badge>
      ),
    },
    {
      header: 'Entity / Target',
      accessorKey: 'entityType',
      cell: (row: AuditLog) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
          {row.entityType ? `${row.entityType} (${row.entityId?.slice(-6)})` : '-'}
        </span>
      ),
    },
    {
      header: 'Changes',
      accessorKey: '_id',
      cell: (row: AuditLog) => {
        const isExpanded = expandedLogId === row._id;
        return (
          <button
            onClick={() => setExpandedLogId(isExpanded ? null : row._id)}
            className="flex items-center gap-1 text-xs text-red-600 hover:underline font-semibold"
          >
            {isExpanded ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" /> Hide Diff
              </>
            ) : (
              <>
                <ChevronRight className="h-3.5 w-3.5" /> View Diff
              </>
            )}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs & Security Trail"
        description="Immutable compliance log of every creation, stock reset, price change, and user action."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Audit Logs' },
        ]}
      />

      {/* Filter Bar */}
      <div className="flex gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <select
          value={module}
          onChange={(e) => {
            setModule(e.target.value);
            setPage(1);
          }}
          aria-label="Filter by system module"
          className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-red-600"
        >
          <option value="">All Modules</option>
          <option value="PRODUCTS">Products</option>
          <option value="INVENTORY">Inventory</option>
          <option value="SALES">Sales</option>
          <option value="PURCHASES">Purchases</option>
          <option value="PAYMENTS">Payments</option>
          <option value="CUSTOMERS">Customers</option>
          <option value="SUPPLIERS">Suppliers</option>
          <option value="EXPENSES">Expenses</option>
          <option value="USERS">Users</option>
          <option value="SETTINGS">Settings</option>
        </select>
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
        emptyMessage="No audit logs recorded."
      />

      {/* Expanded Diff Drawer / Modal */}
      {expandedLogId && (
        <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs space-y-3 border border-slate-800">
          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
            <span className="font-bold text-red-400">
              Audit Record Payload: {expandedLogId}
            </span>
            <button
              onClick={() => setExpandedLogId(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ✕ Close
            </button>
          </div>
          {(() => {
            const log = data?.data?.find((l: AuditLog) => l._id === expandedLogId);
            if (!log) return null;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-rose-400 text-[11px] block mb-1">
                    Previous State:
                  </span>
                  <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-48 text-[11px] text-slate-400">
                    {log.previousData
                      ? JSON.stringify(log.previousData, null, 2)
                      : 'None (New Record Creation)'}
                  </pre>
                </div>
                <div>
                  <span className="text-emerald-400 text-[11px] block mb-1">
                    New State / Applied Mutation:
                  </span>
                  <pre className="bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-48 text-[11px] text-slate-300">
                    {log.newData
                      ? JSON.stringify(log.newData, null, 2)
                      : 'None (Record Deleted)'}
                  </pre>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
