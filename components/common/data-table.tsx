'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Search, ArrowUpDown } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  filterComponent?: React.ReactNode;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends { _id?: string; id?: string }>({
  columns,
  data,
  isLoading,
  searchPlaceholder = 'Search records...',
  searchValue,
  onSearchChange,
  pagination,
  onPageChange,
  onLimitChange,
  filterComponent,
  emptyMessage = 'No records found',
  onRowClick,
}: DataTableProps<T>) {
  return (
    <div className="w-full space-y-4">
      {/* Search & Filter Toolbar */}
      {(onSearchChange || filterComponent) && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {onSearchChange && (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchValue || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="h-9 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>
          )}
          {filterComponent && <div className="flex items-center gap-2">{filterComponent}</div>}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50">
                {columns.map((col, idx) => (
                  <th
                    key={idx}
                    className={cn(
                      'px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider',
                      col.className,
                    )}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-400" />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((_, j) => (
                      <td key={j} className="px-4 py-3.5">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-sm w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-12 text-center text-sm text-slate-500 dark:text-slate-400"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr
                    key={row._id || row.id || idx}
                    onClick={() => onRowClick && onRowClick(row)}
                    className={cn(
                      'hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors',
                      onRowClick && 'cursor-pointer',
                    )}
                  >
                    {columns.map((col, colIdx) => (
                      <td
                        key={colIdx}
                        className={cn('px-4 py-3.5 text-slate-700 dark:text-slate-300', col.className)}
                      >
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? (row as any)[col.accessorKey]
                          : '-'}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
              {pagination.total} results
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-medium px-2 text-slate-700 dark:text-slate-300">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
