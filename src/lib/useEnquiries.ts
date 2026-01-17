'use client';

import { useState, useEffect } from 'react';
import { Enquiry } from './types';

export function useEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/enquiries');
      
      if (!response.ok) {
        throw new Error('Failed to fetch enquiries');
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
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEnquiry = async (enquiry: Partial<Enquiry>) => {
    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add enquiry');
      }
      
      await fetchEnquiries(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add enquiry');
      return false;
    }
  };

  const updateEnquiry = async (enquiry: Enquiry) => {
    try {
      const response = await fetch(`/api/enquiries/${enquiry.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enquiry),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update enquiry');
      }
      
      await fetchEnquiries(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update enquiry');
      return false;
    }
  };

  const deleteEnquiry = async (id: string) => {
    try {
      const response = await fetch(`/api/enquiries/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete enquiry');
      }
      
      await fetchEnquiries(); // Refresh list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete enquiry');
      return false;
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

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