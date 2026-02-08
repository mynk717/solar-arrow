// src/hooks/useSheetConnection.ts
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useSheetConnection() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [sheetId, setSheetId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.sheetId) {
      setIsConnected(true);
      setSheetId(session.user.sheetId);
    } else {
      setIsConnected(false);
      setSheetId(null);
    }
  }, [session]);

  const redirectToSettings = () => {
    router.push('/settings');
  };

  return { isConnected, sheetId, redirectToSettings };
}
