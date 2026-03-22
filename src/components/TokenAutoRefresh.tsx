'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function TokenAutoRefresh() {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    if (!session?.user?.email) return;

    // Silently call test-token — this triggers getValidAccessToken()
    // which auto-refreshes via refreshOrganizationToken() if expired
    // Works for ALL account types (users get org admin's token checked)
    const silentRefresh = async () => {
      try {
        await fetch('/api/test-token');
      } catch { /* silent — never break the UI */ }
    };

    silentRefresh();

    // Also refresh every 45 minutes while user is active
    const interval = setInterval(silentRefresh, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [session?.user?.email, pathname]); // Re-run on every page navigation

  return null;
}
