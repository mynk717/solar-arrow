// src/lib/permissions.ts - COMPLETE FILE WITH TYPE ASSERTIONS

import { UserRole } from './types';

export interface Permission {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canExport: boolean;
}

// ✅ Export AccountType
export type AccountType = 'owner' | 'admin' | 'user';

// Owner and Admin have full access to everything
export const OWNER_ADMIN_PERMISSIONS: Permission = {
  canView: true,
  canEdit: true,
  canDelete: true,
  canExport: true,
};

// Define role-based page access
export const ROLE_PAGE_ACCESS: Record<UserRole, string[]> = {
  owner:           ['*'],
  admin:           ['*'],
  'lead-provider': ['/leads', '/dashboard'],
  telecaller:      ['/leads', '/dashboard'],
  accounts:        ['/payment', '/subsidy', '/enquiries', '/kanban', '/dashboard'],
  sales: ['/leads', '/prospects', '/enquiries', '/kanban', '/dashboard'],
  surveyor: ['/survey', '/enquiries', '/kanban', '/dashboard'],
  registration: ['/registration', '/enquiries', '/kanban', '/dashboard'],
  payment: ['/payments', '/subsidy', '/enquiries', '/kanban', '/dashboard'],
  quotation: ['/quotation', '/enquiries', '/kanban', '/dashboard'],
  liaison: ['/liaison', '/enquiries', '/kanban', '/dashboard'],
  bom: ['/bom', '/enquiries', '/kanban', '/dashboard'],
  dispatch: ['/dispatch', '/enquiries', '/kanban', '/dashboard'],
  installation: ['/installation', '/enquiries', '/kanban', '/dashboard'],
  subsidy: ['/subsidy', '/payments', '/enquiries', '/kanban', '/dashboard'],
};

// Define role-based edit permissions
export const ROLE_EDIT_PERMISSIONS: Record<UserRole, string[]> = {
  owner:           ['*'],
  admin:           ['*'],
  'lead-provider': ['/leads'],
  telecaller:      ['/leads'],
  accounts:        ['/payment', '/subsidy'],
  sales: ['/leads', '/prospects'],
  surveyor: ['/survey'],
  registration: ['/registration'],
  payment: ['/payments'],
  quotation: ['/quotation'],
  liaison: ['/liaison'],
  bom: ['/bom'],
  dispatch: ['/dispatch'],
  installation: ['/installation'],
  subsidy: ['/subsidy'],
};

export function getUserPermissions(
  accountType: AccountType,
  role: UserRole,
  currentPath: string
): Permission {
  // ✅ Use type assertion to fix TypeScript error
  const isOwner = (accountType as string) === 'owner';
  const isAdmin = (accountType as string) === 'admin';
  
  // Owner and Admin have full permissions everywhere
  if (isOwner || isAdmin) {
    return OWNER_ADMIN_PERMISSIONS;
  }

  // Regular users have limited permissions
  const allowedPages = ROLE_PAGE_ACCESS[role] || [];
  const editablePages = ROLE_EDIT_PERMISSIONS[role] || [];

  const canView = allowedPages.includes('*') || allowedPages.some(page => currentPath.startsWith(page));
  const canEdit = editablePages.includes('*') || editablePages.some(page => currentPath.startsWith(page));

  return {
    canView,
    canEdit,
    canDelete: isOwner || isAdmin,
    canExport: canView,
  };
}

// Check if user can access a specific page
export function canAccessPage(
  accountType: AccountType,
  role: UserRole,
  pagePath: string
): boolean {
  // ✅ Use type assertion to fix TypeScript error
  const isOwner = (accountType as string) === 'owner';
  const isAdmin = (accountType as string) === 'admin';
  
  if (isOwner || isAdmin) {
    return true;
  }

  const allowedPages = ROLE_PAGE_ACCESS[role] || [];
  return allowedPages.includes('*') || allowedPages.some(page => pagePath.startsWith(page));
}

// Check if user can edit on a specific page
export function canEditPage(
  accountType: AccountType,
  role: UserRole,
  pagePath: string
): boolean {
  // ✅ Use type assertion to fix TypeScript error
  const isOwner = (accountType as string) === 'owner';
  const isAdmin = (accountType as string) === 'admin';
  
  if (isOwner || isAdmin) {
    return true;
  }

  const editablePages = ROLE_EDIT_PERMISSIONS[role] || [];
  return editablePages.includes('*') || editablePages.some(page => pagePath.startsWith(page));
}
// ADD THIS — resolves permissions from Redis-stored custom perms first,
// falls back to role-based only if no custom perms are set
export interface CustomPermissions {
  canView: string[];
  canEdit: string[];
  canDelete: string[];
  canExport: boolean;
  canAssign: boolean;
}

export function resolvePermissions(
  accountType: AccountType,
  role: UserRole,
  currentPath: string,
  customPerms: CustomPermissions | null | undefined
): Permission {
  // Owner/Admin always get full access — custom perms don't apply
  const isOwner = (accountType as string) === 'owner';
  const isAdmin = (accountType as string) === 'admin';
  if (isOwner || isAdmin) return OWNER_ADMIN_PERMISSIONS;

  // If admin has set custom permissions for this user — use them
  if (customPerms && Array.isArray(customPerms.canView) && customPerms.canView.length > 0) {
    const matchedPath = currentPath.replace(/^\//, '').split('/')[0]; // e.g. "leads"
    return {
      canView: customPerms.canView.some(p => currentPath.startsWith('/' + p) || currentPath.startsWith(p)),
      canEdit: Array.isArray(customPerms.canEdit)
        ? customPerms.canEdit.some(p => currentPath.startsWith('/' + p) || currentPath.startsWith(p))
        : false,
      canDelete: Array.isArray(customPerms.canDelete) && customPerms.canDelete.length > 0,
      canExport: customPerms.canExport ?? false,
    };
  }

  // No custom perms set → fall back to role-based defaults
  return getUserPermissions(accountType, role, currentPath);
}
