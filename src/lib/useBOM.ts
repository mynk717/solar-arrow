// src/lib/useBOM.ts
import { useState, useEffect } from 'react';
import type { BOMLineItem } from './types';
export interface BOMItem {
  id: string;
  enquiryId: string;
  bomStatus: string;
  bomGeneratedDate: string;
  bomGeneratedBy: string;
  dispatchStatus: string;
  dispatchDate?: string;
  dispatchedBy?: string;
  trackingNumber?: string;
  vehicleNumber?: string;
  driverName?: string;
  driverContact?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  deliveredTo?: string;
  deliveryNotes?: string;
  installationStatus: string;
  installationStartDate?: string;
  installationCompletedDate?: string;
  installedBy?: string;
  materialUtilizationStatus: string;
  materialReturnStatus: string;
  returnCollectedDate?: string;
  returnCollectedBy?: string;
  sno: number;
  section: string;
  particular: string;
  uom: string;
  qty: number;
  rem?: string;
  qtyDispatched: number;
  qtyUtilized: number;
  qtyReturned: number;
  utilizationNotes?: string;
  createdAt: string;
  updatedAt?: string;
}

export function useBOM() {
  const [boms, setBoms] = useState<BOMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/bom');
      if (!response.ok) throw new Error('Failed to fetch BOMs');
      const data = await response.json();
      setBoms(data);
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
