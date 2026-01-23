// src/app/prospects/page.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProspectsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to leads page
    router.push('/leads');
  }, [router]);

  return null;
}
