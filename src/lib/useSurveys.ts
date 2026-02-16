'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { Survey } from './types';

export function useSurveys() {
  const { data: session, status } = useSession();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSurveys = useCallback(async () => {
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      setError('Please sign in to view surveys');
      setLoading(false);
      return;
    }

    if (!session?.user?.email || !session?.user?.organizationId) {
      setError('Missing user credentials');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Fetching surveys from API...');
      
      const response = await fetch('/api/survey/list');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch surveys');
      }

      const data = await response.json();
      console.log('✅ Surveys fetched:', data.surveys?.length || 0);
      
      setSurveys(data.surveys || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch surveys';
      setError(errorMessage);
      console.error('❌ Error fetching surveys:', err);
    } finally {
      setLoading(false);
    }
  }, [status, session]);

  // Fetch on mount and when session changes
  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  const scheduleSurvey = async (data: {
    enquiryId: string;
    surveyDate: string;
    assignedTo: string;
    assignedToName: string;
  }) => {
    try {
      const response = await fetch('/api/survey/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to schedule survey');
      }

      await fetchSurveys();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to schedule survey';
      setError(errorMessage);
      throw err;
    }
  };

  const submitSurvey = async (surveyData: Partial<Survey>) => {
    try {
      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(surveyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit survey');
      }

      await fetchSurveys();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit survey';
      setError(errorMessage);
      throw err;
    }
  };

  const approveSurvey = async (enquiryId: string, approved: boolean, rejectionReason?: string) => {
    try {
      const response = await fetch('/api/survey/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiryId, approved, rejectionReason }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update survey');
      }

      await fetchSurveys();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update survey';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    surveys,
    loading,
    error,
    refetch: fetchSurveys,
    scheduleSurvey,
    submitSurvey,
    approveSurvey,
  };
}
