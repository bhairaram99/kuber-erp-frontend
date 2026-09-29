'use client';

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from './button';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  name: string;
  kind: string;
  detail: string;
  isLoading?: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({
  isOpen,
  name,
  kind,
  detail,
  isLoading,
  error,
  onClose,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (isOpen) setStep(1);
  }, [isOpen, name]);

  if (!isOpen) return null;

  const isFinal = step === 2;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close delete confirmation"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={isLoading ? undefined : onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirm-title"
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="h-1.5 bg-gradient-to-r from-rose-500 via-red-600 to-rose-400" />
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] text-white">
                {step}
              </span>
              Step {step} of 2
            </span>
            <span className="text-[11px] font-medium text-slate-400">Please read before continuing</span>
          </div>

          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40">
            {isFinal ? <Trash2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6" />}
          </div>

          <h2 id="delete-confirm-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {isFinal ? `Delete ${kind} permanently?` : `Delete this ${kind}?`}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {isFinal
              ? 'This is the last check. Once you delete it, this record is gone and cannot be brought back.'
              : detail}
          </p>

          <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 dark:border-rose-900/50 dark:bg-rose-950/20">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-rose-500">Selected {kind}</p>
            <p className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-100">{name}</p>
          </div>

          {error && (
            <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
              {error}
            </p>
          )}

          <div className="mt-6 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            {isFinal ? (
              <Button type="button" variant="destructive" onClick={onConfirm} isLoading={isLoading}>
                Yes, delete it
              </Button>
            ) : (
              <Button type="button" onClick={() => setStep(2)}>
                Continue
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
