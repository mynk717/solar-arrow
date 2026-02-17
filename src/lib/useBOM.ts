// src/lib/useBOM.ts
import { useState, useEffect } from 'react';

/**
 * NEW BOM Structure: 1 BOM = 1 Row with JSON materials
 */
export interface BOMLineItem {
  bomId: string;
  enquiryId: string;
  customerName: string;
  systemCapacity: string;
  
  // BOM Status
  bomStatus: 'draft' | 'generated' | 'approved' | 'cancelled';
  bomGeneratedDate: string;
  bomGeneratedBy: string;
  
  // Dispatch Tracking
  dispatchStatus: 'pending' | 'dispatched' | 'in_transit' | 'delivered';
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
  
  // Installation
  installationStatus: 'not_started' | 'in_progress' | 'completed';
  installationDate?: string;
  installedBy?: string;
  
  // Materials - Stored as JSON string
  materialsJSON: string;
  
  // Material Utilization
  materialUtilizationStatus: 'not_started' | 'partial' | 'completed';
  materialReturnStatus: 'not_applicable' | 'pending' | 'collected';
  returnCollectedDate?: string;
  utilizationNotes?: string;
  
  // Metadata
  createdAt: string;
  updatedAt?: string;
}

/**
 * Individual material item (inside materialsJSON)
 */
export interface MaterialItem {
  sno: number;
  section: string;
  particular: string;
  uom: string;
  qty: number;
  rem?: string;
  qtyDispatched: number;
  qtyUtilized: number;
  qtyReturned: number;
}

/**
 * Hook to fetch and manage BOMs
 */
export function useBOM() {
  const [boms, setBoms] = useState<BOMLineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBOMs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/bom');
      
      if (!response.ok) {
        throw new Error('Failed to fetch BOMs');
      }
      
      const data = await response.json();
      
      // API returns { boms: [...], cached: boolean }
      setBoms(data.boms || data || []);
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

  return { 
    boms, 
    loading, 
    error, 
    refetch: fetchBOMs 
  };
}

/**
 * Helper: Parse materials from JSON string
 */
export function parseMaterials(materialsJSON: string): MaterialItem[] {
  try {
    const parsed = JSON.parse(materialsJSON);
    return parsed.items || [];
  } catch (error) {
    console.error('Failed to parse materials JSON:', error);
    return [];
  }
}

/**
 * Helper: Get total material count
 */
export function getMaterialCount(materialsJSON: string): number {
  const materials = parseMaterials(materialsJSON);
  return materials.length;
}

/**
 * Helper: Get total quantity across all materials
 */
export function getTotalQuantity(materialsJSON: string): number {
  const materials = parseMaterials(materialsJSON);
  return materials.reduce((sum, item) => sum + item.qty, 0);
}
