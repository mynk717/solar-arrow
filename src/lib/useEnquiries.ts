'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Enquiry } from './types';
import { useDemoMode } from '@/contexts/DemoContext'; // ✅ Add this
import { demoEnquiries } from './demoData'; // ✅ Add this


export function useEnquiries() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode(); // ✅ Add this
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sheetId, setSheetId] = useState<string | null>(null);
  const [lastCacheTimestamp, setLastCacheTimestamp] = useState<number | null>(null);
const [pollingEnabled, setPollingEnabled] = useState(true);


  // ✅ Load sheet ID from organization settings
  useEffect(() => {
    const loadSheetId = async () => {
      if (status === 'loading') return;
      
      if (status === 'unauthenticated') {
        setError('Please sign in to view enquiries');
        setLoading(false);
        return;
      }

      if (!session?.user?.organizationId) {
        setError('No organization found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (data.sheetId) {
          setSheetId(data.sheetId);
        } else {
          setError('No Google Sheet connected. Please connect your sheet in Settings.');
        }
      } catch (err) {
        console.error('Failed to load sheet config:', err);
        setError('Failed to load configuration');
      } finally {
        setLoading(false);
      }
    };

    loadSheetId();
  }, [session, status]);

  
// Check if cache has been updated by another user
const checkForUpdates = useCallback(async () => {
  if (!session?.user?.organizationId || isDemoMode) return;

  try {
    const response = await fetch(`/api/cache/check-timestamp?orgId=${session.user.organizationId}`);
    const data = await response.json();
    
    if (data.timestamp && lastCacheTimestamp && data.timestamp > lastCacheTimestamp) {
      console.log('🔄 New data detected, refreshing...');
      await fetchEnquiries();
      
      // Optional: Show toast notification
      if (data.updatedBy && data.updatedBy !== session.user.email) {
        console.log(`📢 Data updated by ${data.updatedBy}`);
        // You can add toast notification here later
      }
    }
  } catch (err) {
    console.error('Error checking for updates:', err);
  }
}, [session, lastCacheTimestamp, isDemoMode]);

  const fetchEnquiries = async () => {
    if (status === 'loading') return;

    // ✅ If demo mode, return demo data immediately
    if (isDemoMode) {
      setEnquiries(demoEnquiries);
      setLoading(false);
      return;
    }

    if (status === 'unauthenticated') {
      setError('Please sign in to view enquiries');
      setLoading(false);
      return;
    }

    // ✅ Wait for sheetId to load
    if (!sheetId) {
      setError('No sheet connected. Please configure in Settings.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/enquiries?sheetId=${sheetId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch enquiries');
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const enquiriesWithDates = data.map((e: any) => ({
        ...e,
        createdAt: new Date(e.createdAt),
        updatedAt: new Date(e.updatedAt),
        surveyDate: e.surveyDate ? new Date(e.surveyDate) : undefined,
        registrationDate: e.registrationDate ? new Date(e.registrationDate) : undefined,
        paymentDate: e.paymentDate ? new Date(e.paymentDate) : undefined,
        dispatchDate: e.dispatchDate ? new Date(e.dispatchDate) : undefined,
        installationDate: e.installationDate ? new Date(e.installationDate) : undefined,
        inspectionDate: e.inspectionDate ? new Date(e.inspectionDate) : undefined,
        activationDate: e.activationDate ? new Date(e.activationDate) : undefined,
      }));
      setEnquiries(enquiriesWithDates);
      
      // ✅ Track cache timestamp
      setLastCacheTimestamp(Date.now());
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch enquiries';
      setError(errorMessage);
      console.error('Error fetching enquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fetch on mount and when sheetId or demo mode changes
  useEffect(() => {
    fetchEnquiries();
  }, [status, sheetId, isDemoMode]);

  const addEnquiry = async (enquiry: Partial<Enquiry>) => {
    if (!sheetId) {
      setError('No sheet connected');
      return false;
    }
  
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...enquiry, sheetId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add enquiry');
      }
  
      const newEnquiry = await response.json();
      
      // ✅ Optimistic add
      setEnquiries(prev => [...prev, newEnquiry]);
      setLastCacheTimestamp(Date.now());
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add enquiry';
      setError(errorMessage);
      return false;
    }
  };
  

  const updateEnquiry = async (enquiry: Enquiry) => {
    if (!sheetId) {
      setError('No sheet connected');
      return false;
    }
  
    // ✅ Optimistic update - show immediately
    setEnquiries(prev => 
      prev.map(e => e.id === enquiry.id ? enquiry : e)
    );
  
    try {
      const response = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...enquiry, sheetId }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update enquiry');
      }
  
      // ✅ Update cache timestamp
      setLastCacheTimestamp(Date.now());
      return true;
    } catch (err) {
      // ⚠️ Revert optimistic update on error
      await fetchEnquiries();
      const errorMessage = err instanceof Error ? err.message : 'Failed to update enquiry';
      setError(errorMessage);
      return false;
    }
  };
  

  const deleteEnquiry = async (id: string) => {
    if (!sheetId) {
      setError('No sheet connected');
      return false;
    }
  
    // ✅ Optimistic delete
    setEnquiries(prev => prev.filter(e => e.id !== id));
  
    try {
      const response = await fetch(`/api/enquiries/${id}?sheetId=${sheetId}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete enquiry');
      }
  
      setLastCacheTimestamp(Date.now());
      return true;
    } catch (err) {
      // ⚠️ Revert on error
      await fetchEnquiries();
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete enquiry';
      setError(errorMessage);
      return false;
    }
  };
  
// Polling: Check for updates every 5 seconds
useEffect(() => {
  if (!pollingEnabled || isDemoMode || status !== 'authenticated') return;

  const interval = setInterval(() => {
    checkForUpdates();
  }, 5000); // Check every 5 seconds

  return () => clearInterval(interval);
}, [checkForUpdates, pollingEnabled, isDemoMode, status]);

  return {
    enquiries,
    loading,
    error,
    refetch: fetchEnquiries,
    addEnquiry,
    updateEnquiry,
    deleteEnquiry,
  };
}
