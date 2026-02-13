// src/lib/useLeads.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDemoMode } from '@/contexts/DemoContext';
import { Lead } from './types';

export function useLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { isDemoMode } = useDemoMode();

  const fetchLeads = useCallback(async (showLoading = false, silent = false) => {
    try {
      if (showLoading) {
        setRefreshing(true);
      } else if (leads.length === 0 && !silent) {
        setLoading(true);
      }
      
      const response = await fetch('/api/leads', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }

      const data = await response.json();

      setLeads(data);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      setLastUpdated(new Date());
      
      if (!silent) {
        console.log(`✅ Leads updated: ${data.length} leads`);
      }
    } catch (err: any) {
      console.error('Error fetching leads:', err);
      if (!silent) {
        setError(err.message || 'Failed to load leads');
      }
      setLoading(false);
      setRefreshing(false);
    }
  }, [leads.length]);

  useEffect(() => {
    // Initial fetch
    fetchLeads();
    
    // ✅ Silent background sync every 15 seconds
    if (!isDemoMode) {
      const interval = setInterval(() => {
        fetchLeads(false, true); // Silent refresh
      }, 15000); // 15 seconds

      return () => clearInterval(interval);
    }
  }, [isDemoMode, fetchLeads]);

  // ✅ Manual refresh (shows loading state)
  const refresh = useCallback(() => {
    fetchLeads(true);
  }, [fetchLeads]);

  // ✅ Silent refresh (no loading state)
  const refreshSilent = useCallback(() => {
    fetchLeads(false, true);
  }, [fetchLeads]);

  return { 
    leads, 
    loading, 
    refreshing, 
    error, 
    lastUpdated, 
    refresh,
    refreshSilent,
  };
}
