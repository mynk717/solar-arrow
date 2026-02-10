// src/hooks/usePermissions.ts - UPDATED with proper types

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { getUserPermissions, type Permission, type AccountType } from '@/lib/permissions';
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

  // ✅ FIXED: Proper type casting with fallback
  const accountType = (session?.user?.accountType as AccountType) || 'user';
  const role = (session?.user?.role as UserRole) || null;
  const branchId = session?.user?.branchId;
  const branchName = session?.user?.branchName;

  const permissions = role 
    ? getUserPermissions(accountType, role, pathname || '/')
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
