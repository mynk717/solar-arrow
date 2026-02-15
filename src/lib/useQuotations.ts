'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Quotation } from './quotations';

export function useQuotations() {
  const { data: session, status } = useSession();
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotations = useCallback(async () => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      setError('Please sign in to view quotations');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/quotations/list');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quotations');
      }

      const data = await response.json();
      setQuotations(data.quotations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotations';
      setError(errorMessage);
      console.error('Error fetching quotations:', err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  // Fetch on mount
  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  const createQuotation = async (quotationData: Partial<Quotation>) => {
    try {
      const response = await fetch('/api/quotations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quotationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create quotation');
      }

      const data = await response.json();
      
      // Refresh list
      await fetchQuotations();
      
      return data.quotation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quotation';
      setError(errorMessage);
      throw err;
    }
  };

  const sendQuotation = async (quotationId: string) => {
    try {
      const response = await fetch('/api/quotations/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotationId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send quotation');
      }

      // Refresh list
      await fetchQuotations();
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send quotation';
      setError(errorMessage);
      return false;
    }
  };

  const getQuotationById = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/quotations/${quotationId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch quotation');
      }

      const data = await response.json();
      return data.quotation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch quotation';
      setError(errorMessage);
      return null;
    }
  };

  return {
    quotations,
    loading,
    error,
    refetch: fetchQuotations,
    createQuotation,
    sendQuotation,
    getQuotationById,
  };
}
