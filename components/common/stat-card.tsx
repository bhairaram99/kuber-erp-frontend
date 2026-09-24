import React from 'react';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: React.ReactNode;
  subtitle?: string;
  extra?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  tone?: 'default' | 'danger';
}

export function StatCard({
  title,
  value,
  change,
  isPositive,
  icon,
  subtitle,
  extra,
  className,
  onClick,
  tone = 'default',
}: StatCardProps) {
  const danger = tone === 'danger';
  return (
    <Card
      className={cn(
        'overflow-hidden',
        danger && 'border-red-700 bg-red-600 text-white shadow-md',
        onClick && 'cursor-pointer transition hover:border-red-300 hover:shadow-md',
        danger && onClick && 'hover:bg-red-700 hover:border-red-800',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <p
            className={cn(
              'text-xs font-semibold uppercase tracking-wider',
              danger ? 'text-red-100' : 'text-slate-500 dark:text-slate-400',
            )}
          >
            {title}
          </p>
          <div
            className={cn(
              'h-10 w-10 rounded-lg border flex items-center justify-center shadow-xs',
              danger
                ? 'bg-white/15 border-white/25 text-white'
                : 'bg-red-50 dark:bg-red-950/40 border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400',
            )}
          >
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <h3
            className={cn(
              'text-2xl font-bold tracking-tight',
              danger ? 'text-white' : 'text-slate-900 dark:text-slate-100',
            )}
          >
            {value}
          </h3>
          {(change || subtitle) && (
            <div className={cn('mt-2 flex items-center text-xs', danger ? 'text-red-100' : 'text-slate-500')}>
              {change && (
                <span
                  className={cn(
                    'font-semibold mr-1.5',
                    danger
                      ? 'text-white'
                      : isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400',
                  )}
                >
                  {isPositive ? '+' : ''}{change}
                </span>
              )}
              {subtitle && <span>{subtitle}</span>}
            </div>
          )}
          {extra}
        </div>
      </CardContent>
    </Card>
  );
}
