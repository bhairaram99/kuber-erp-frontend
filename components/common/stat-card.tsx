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
}: StatCardProps) {
  return (
    <Card
      className={cn(
        'overflow-hidden',
        onClick && 'cursor-pointer transition hover:border-red-300 hover:shadow-md',
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
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-100 dark:border-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 shadow-xs">
            {icon}
          </div>
        </div>
        <div className="mt-3">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
          {(change || subtitle) && (
            <div className="mt-2 flex items-center text-xs text-slate-500">
              {change && (
                <span
                  className={cn(
                    'font-semibold mr-1.5',
                    isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
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
