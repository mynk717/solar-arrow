// src/lib/useBOM.ts
import { useState, useEffect } from 'react';

export interface BOMLineItem {
  bomId: string;
  enquiryId: string;
  customerName: string;
  systemCapacity: string;
  bomStatus: string;
  dispatchStatus: string;
  bomGeneratedDate: string;
  dispatchDate?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  expectedDeliveryDate?: string;
  materialsJSON: string;
  // Add any other fields from your sheet
}

export function useBOM() {
  const [boms, setBoms] = useState<BOMLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bom');
      if (!response.ok) throw new Error('Failed to fetch BOMs');
      const data = await response.json();
      
      // Handle both old format and new format
      const bomsArray = data.boms || data;
      setBoms(bomsArray);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching BOMs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBOMs();
  }, []);

  return { boms, loading, error, refetch: fetchBOMs };
}
