// src/lib/useLeads.ts
'use client';

import { useState, useEffect } from 'react';
import { useDemoMode } from '@/contexts/DemoContext';
import { Lead } from './types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isDemoMode } = useDemoMode();

  useEffect(() => {
    let isMounted = true;
    let pollInterval: NodeJS.Timeout;

    async function fetchLeads() {
      try {
        setLoading(true);
        const response = await fetch('/api/leads', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch leads: ${response.status}`);
        }

        const data = await response.json();

        if (isMounted) {
          setLeads(data);
          setError(null);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error fetching leads:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load leads');
          setLoading(false);
        }
      }
    }

    // Initial fetch
    fetchLeads();

    // Poll every 5 seconds for real-time updates
    if (!isDemoMode) {
      pollInterval = setInterval(fetchLeads, 5000);
    }

    return () => {
      isMounted = false;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isDemoMode]);

  return { leads, loading, error };
}
