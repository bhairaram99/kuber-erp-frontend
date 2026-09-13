'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { categoryService } from '../../../services/category.service';
import { PageHeader } from '../../../components/common/page-header';
import { DataTable, Column } from '../../../components/common/data-table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog } from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Category } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { PermissionGuard } from '../../../components/common/permission-guard';
import { PERMISSIONS } from '../../../lib/permissions';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [error, setError] = useState<string | null>(null);

  const { data: categoriesRes, isLoading } = useQuery({
    queryKey: ['categories', page, search],
    queryFn: () => categoryService.findPaginated({ page, limit: 10, search: search || undefined }),
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editingCategory) {
        return categoryService.update(editingCategory._id, { name, description, status });
      }
      return categoryService.create({ name, description, status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setError(err.message || 'Operation failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories-all'] });
    },
  });

  const resetForm = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setStatus('ACTIVE');
    setError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setStatus(cat.status);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, catName: string) => {
    if (confirm(`Are you sure you want to delete category "${catName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const columns: Column<Category>[] = [
    {
      header: 'Category Name',
      cell: (row) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100">{row.name}</span>
          {row.description && (
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'ACTIVE' ? 'success' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Created Date',
      cell: (row) => <span className="text-xs text-slate-500">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <PermissionGuard permission={PERMISSIONS.CATEGORIES_UPDATE}>
            <button
              onClick={() => handleOpenEdit(row)}
              className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-red-600"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission={PERMISSIONS.CATEGORIES_DELETE}>
            <button
              onClick={() => handleDelete(row._id, row.name)}
              className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wood Material Categories"
        description="Configure product classifications (Hardwood, Softwood, Plywood, Veneers, Engineered Panels)."
        actions={
          <PermissionGuard permission={PERMISSIONS.CATEGORIES_CREATE}>
            <Button
              onClick={handleOpenCreate}
              className="bg-red-600 hover:bg-red-700 text-white font-medium"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Category
            </Button>
          </PermissionGuard>
        }
      />

      <DataTable
        columns={columns}
        data={categoriesRes?.data || []}
        isLoading={isLoading}
        searchPlaceholder="Search categories..."
        searchValue={search}
        onSearchChange={setSearch}
        pagination={categoriesRes?.pagination}
        onPageChange={setPage}
      />

      {/* Create / Edit Category Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Wood Category' : 'Create Wood Category'}
        description="Categories organize your timber products and reporting aggregations."
      >
        {error && (
          <div className="mb-4 p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
            {error}
          </div>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          <Input
            label="Category Name *"
            required
            placeholder="e.g. Exotic Hardwood Planks"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="Description"
            placeholder="Timber density, application usage..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white"
              isLoading={saveMutation.isPending}
            >
              {editingCategory ? 'Update Category' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
