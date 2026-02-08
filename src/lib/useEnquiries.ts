'use client';

import { useState, useEffect } from 'react';
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

      await fetchEnquiries(); // Refresh list
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

      await fetchEnquiries(); // Refresh list
      return true;
    } catch (err) {
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

    try {
      const response = await fetch(`/api/enquiries/${id}?sheetId=${sheetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete enquiry');
      }

      await fetchEnquiries(); // Refresh list
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete enquiry';
      setError(errorMessage);
      return false;
    }
  };

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
