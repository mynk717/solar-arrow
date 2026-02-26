// src/hooks/usePermissions.ts
'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { resolvePermissions, type Permission, type AccountType } from '@/lib/permissions';
import type { UserRole } from '@/lib/types';

export function usePermissions(): Permission & {
  isOwner: boolean;
  isAdmin: boolean;
  isUser: boolean;
  role: UserRole | null;
  branchId?: string;
  branchName?: string;
} {
  const { data: session } = useSession();
  const pathname = usePathname();

  const accountType = session?.user?.accountType as AccountType ?? 'user';
  const role = session?.user?.role as UserRole | null;
  const customPerms = session?.user?.permissions as any ?? null;
  const branchId = session?.user?.branchId;
  const branchName = session?.user?.branchName;

  const permissions = role
    ? resolvePermissions(accountType, role, pathname, customPerms)
    : { canView: false, canEdit: false, canDelete: false, canExport: false };

  return {
    ...permissions,
    isOwner: accountType === 'owner',
    isAdmin: accountType === 'admin',
    isUser: accountType === 'user',
    role,
    branchId,
    branchName,
  };
}
