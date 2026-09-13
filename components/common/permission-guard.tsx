'use client';

import React from 'react';
import { useAuth } from '../../providers/auth-provider';

interface PermissionGuardProps {
  permission: string | string[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGuard({
  permission,
  fallback = null,
  children,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  const required = Array.isArray(permission) ? permission : [permission];
  const allowed = required.every((p) => hasPermission(p));

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
