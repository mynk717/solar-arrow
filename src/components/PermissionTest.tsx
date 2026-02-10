// src/components/PermissionTest.tsx - TEST COMPONENT
'use client';

import { usePermissions } from '@/hooks/usePermissions';

export function PermissionTest() {
  const permissions = usePermissions();

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-2">Current Permissions:</h3>
      <ul className="text-sm space-y-1">
        <li>✓ Can View: {permissions.canView ? '✅' : '❌'}</li>
        <li>✓ Can Edit: {permissions.canEdit ? '✅' : '❌'}</li>
        <li>✓ Can Delete: {permissions.canDelete ? '✅' : '❌'}</li>
        <li>✓ Can Export: {permissions.canExport ? '✅' : '❌'}</li>
        <li>✓ Is Owner: {permissions.isOwner ? '✅' : '❌'}</li>
        <li>✓ Is Admin: {permissions.isAdmin ? '✅' : '❌'}</li>
        <li>✓ Role: {permissions.role || 'None'}</li>
        {permissions.branchName && (
          <li>✓ Branch: {permissions.branchName} ({permissions.branchId})</li>
        )}
      </ul>
    </div>
  );
}
