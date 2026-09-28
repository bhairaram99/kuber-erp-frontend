'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function pad(value: number) {
  return String(value).padStart(2, '0');
}

function toIso(year: number, month: number, day: number) {
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function isoToDisplay(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return '';
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function parseDisplayDate(text: string): string | null {
  const match = /^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || year < 1990 || year > 2100) return null;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return toIso(year, month, day);
}

function partsFromIso(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) {
    const today = new Date();
    return { year: today.getFullYear(), month: today.getMonth(), day: today.getDate() };
  }
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

interface DatePickerProps {
  value: string;
  onChange: (isoDate: string) => void;
  required?: boolean;
}

export function DatePicker({ value, onChange, required }: DatePickerProps) {
  const [text, setText] = useState(isoToDisplay(value));
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const selected = partsFromIso(value);
  const [viewYear, setViewYear] = useState(selected.year);
  const [viewMonth, setViewMonth] = useState(selected.month);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setText(isoToDisplay(value));
  }, [value]);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const start = Math.min(2015, viewYear);
    const end = Math.max(current + 2, viewYear);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [viewYear]);

  const days = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const lead = (first.getDay() + 6) % 7;
    const count = new Date(viewYear, viewMonth + 1, 0).getDate();
    return { lead, count };
  }, [viewYear, viewMonth]);

  const applyIso = (iso: string) => {
    setError('');
    setText(isoToDisplay(iso));
    onChange(iso);
    const next = partsFromIso(iso);
    setViewYear(next.year);
    setViewMonth(next.month);
  };

  const commitText = (raw: string) => {
    if (!raw.trim()) {
      setError(required ? 'Enter the date as dd/mm/yyyy' : '');
      onChange('');
      return;
    }
    const iso = parseDisplayDate(raw);
    if (!iso) {
      setError('Use dd/mm/yyyy, for example 25/09/2026');
      onChange('');
      return;
    }
    applyIso(iso);
  };

  const shiftMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth() + 1, today.getDate());

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        <input
          value={text}
          required={required}
          inputMode="numeric"
          placeholder="dd/mm/yyyy"
          aria-label="Payment date"
          onChange={(event) => {
            const next = event.target.value;
            setText(next);
            const iso = parseDisplayDate(next);
            if (iso) applyIso(iso);
            else if (error) setError('');
          }}
          onBlur={() => commitText(text)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              commitText(text);
              setOpen(false);
            }
          }}
          className={cn(
            'h-9 w-full rounded-md border bg-white px-3 pr-10 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 dark:bg-slate-900',
            error
              ? 'border-rose-500 focus-visible:ring-rose-500'
              : 'border-slate-300 focus-visible:ring-red-600 dark:border-slate-700',
          )}
        />
        <button
          type="button"
          aria-label="Open calendar"
          onClick={() => {
            const next = partsFromIso(value || todayIso);
            setViewYear(next.year);
            setViewMonth(next.month);
            setOpen((current) => !current);
          }}
          className="absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-500 hover:text-red-600"
        >
          <Calendar className="h-4 w-4" />
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}

      {open && (
        <div className="absolute bottom-full left-0 z-30 mb-1 w-[280px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <select
              aria-label="Month"
              value={viewMonth}
              onChange={(event) => setViewMonth(Number(event.target.value))}
              className="h-8 flex-1 rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
            >
              {MONTHS.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
            <select
              aria-label="Year"
              value={viewYear}
              onChange={(event) => setViewYear(Number(event.target.value))}
              className="h-8 w-[76px] rounded-md border border-slate-200 bg-white px-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase text-slate-400">
            {WEEKDAYS.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {Array.from({ length: days.lead }).map((_, index) => (
              <span key={`empty-${index}`} />
            ))}
            {Array.from({ length: days.count }).map((_, index) => {
              const day = index + 1;
              const iso = toIso(viewYear, viewMonth + 1, day);
              const isSelected = iso === value;
              const isToday = iso === todayIso;
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => {
                    applyIso(iso);
                    setOpen(false);
                  }}
                  className={cn(
                    'h-8 rounded-md text-xs font-medium text-slate-700 hover:bg-red-50 hover:text-red-700 dark:text-slate-200',
                    isToday && !isSelected && 'ring-1 ring-red-300',
                    isSelected && 'bg-red-600 text-white hover:bg-red-700 hover:text-white',
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
          <button
            type="button"
            onClick={() => {
              applyIso(todayIso);
              setOpen(false);
            }}
            className="mt-2 w-full rounded-md py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
}
