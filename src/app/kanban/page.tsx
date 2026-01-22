// src/app/kanban/page.tsx
'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Enquiry, EnquiryStatus, KanbanColumn } from '@/lib/types';
import { useEnquiries } from '@/lib/useEnquiries';

const KANBAN_COLUMNS: KanbanColumn[] = [
  { 
    id: 'prospect', 
    title: 'Prospects/Sales Pitch', 
    status: ['prospect'], 
    color: 'bg-purple-500',
    order: 1
  },
  { 
    id: 'lead', 
    title: 'Leads/Enquiries', 
    status: ['lead', 'new'], 
    color: 'bg-blue-500',
    order: 2
  },
  { 
    id: 'registration', 
    title: 'Registration', 
    status: ['registration_pending', 'registration_completed'], 
    color: 'bg-yellow-500',
    order: 3
  },
  { 
    id: 'payment', 
    title: 'Payment', 
    status: ['payment_pending', 'payment_received', 'payment_disbursed'], 
    color: 'bg-green-500',
    order: 4
  },
  { 
    id: 'quotation', 
    title: 'Quotation', 
    status: ['quotation_pending', 'quotation_approved'], 
    color: 'bg-indigo-500',
    order: 5
  },
  { 
    id: 'liaison-pre', 
    title: 'Liaison (Pre)', 
    status: ['liaison_pre'], 
    color: 'bg-pink-500',
    order: 6
  },
  { 
    id: 'bom', 
    title: 'BOM Generation', 
    status: ['bom_pending', 'bom_approved'], 
    color: 'bg-orange-500',
    order: 7
  },
  { 
    id: 'dispatch', 
    title: 'Material Dispatch', 
    status: ['dispatch_pending', 'dispatch_scheduled', 'dispatch_in_transit', 'dispatched', 'dispatch_delivered'], 
    color: 'bg-teal-500',
    order: 8
  },
  { 
    id: 'installation', 
    title: 'Installation', 
    status: ['installation_pending', 'installation_in_progress', 'installation_completed'], 
    color: 'bg-cyan-500',
    order: 9
  },
  { 
    id: 'liaison-grid', 
    title: 'Liaison (Grid Sync)', 
    status: ['liaison_grid'], 
    color: 'bg-rose-500',
    order: 10
  },
  { 
    id: 'wcr', 
    title: 'WCR', 
    status: ['wcr_pending', 'wcr_submitted', 'wcr_approved'], 
    color: 'bg-lime-500',
    order: 11
  },
  { 
    id: 'subsidy', 
    title: 'Subsidy Disbursement', 
    status: ['subsidy_pending', 'subsidy_disbursed'], 
    color: 'bg-emerald-500',
    order: 12
  },
];

export default function KanbanBoard() {
  const { enquiries, loading } = useEnquiries();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [localEnquiries, setLocalEnquiries] = useState<Enquiry[]>([]);

  // Sync with loaded enquiries
  useState(() => {
    if (enquiries.length > 0 && localEnquiries.length === 0) {
      setLocalEnquiries(enquiries);
    }
  });

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  // In handleDragEnd function
const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }
    
    const enquiryId = active.id as string;
    const newColumnId = over.id as string;
    
    const column = KANBAN_COLUMNS.find(col => col.id === newColumnId);
    
    if (column) {
      const newStatus = column.status[0];
      
      // Update local state immediately
      setLocalEnquiries(prev => 
        prev.map(e => 
          e.id === enquiryId 
            ? { ...e, status: newStatus, updatedAt: new Date() } 
            : e
        )
      );
  
      // Update via API
      try {
        const response = await fetch(`/api/enquiries/${enquiryId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
  
        if (!response.ok) {
          throw new Error('Failed to update enquiry');
        }
  
        console.log(`Successfully updated ${enquiryId} to ${newStatus}`);
      } catch (error) {
        console.error('Error updating enquiry:', error);
        // Optionally revert the local state change
        setLocalEnquiries(prev => 
          prev.map(e => e.id === enquiryId ? enquiries.find(orig => orig.id === enquiryId) || e : e)
        );
      }
    }
    
    setActiveId(null);
  };
  

  const getEnquiriesForColumn = (columnStatuses: EnquiryStatus[]) => {
    const enquiriesToUse = localEnquiries.length > 0 ? localEnquiries : enquiries;
    return enquiriesToUse.filter(e => columnStatuses.includes(e.status));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading kanban board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kanban Dashboard</h1>
        <p className="text-gray-600 mt-2">Drag and drop to update project status</p>
      </div>

      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(column => (
            <KanbanColumnComponent
              key={column.id}
              column={column}
              enquiries={getEnquiriesForColumn(column.status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeId ? (
            <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-blue-500">
              <p className="font-semibold">Dragging...</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function KanbanColumnComponent({ 
  column, 
  enquiries 
}: { 
  column: KanbanColumn; 
  enquiries: Enquiry[];
}) {
  return (
    <div className="flex-shrink-0 w-80">
      <div className={`${column.color} text-white rounded-t-lg p-3`}>
        <h3 className="font-semibold">{column.title}</h3>
        <span className="text-sm opacity-90">{enquiries.length} items</span>
      </div>
      
      <SortableContext items={enquiries.map(e => e.id)} strategy={verticalListSortingStrategy}>
        <div className="bg-gray-100 rounded-b-lg p-3 min-h-[500px] space-y-2">
          {enquiries.map(enquiry => (
            <EnquiryCard key={enquiry.id} enquiry={enquiry} />
          ))}
          
          {enquiries.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <p className="text-sm">No items</p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

function EnquiryCard({ enquiry }: { enquiry: Enquiry }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow hover:shadow-md transition-shadow cursor-move">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-gray-900 text-sm">{enquiry.customerName}</h4>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          enquiry.panelTag === 'RTS' ? 'bg-blue-100 text-blue-800' :
          enquiry.panelTag === 'Commercial' ? 'bg-purple-100 text-purple-800' :
          'bg-green-100 text-green-800'
        }`}>
          {enquiry.panelTag}
        </span>
      </div>
      
      <p className="text-xs text-gray-600 mb-1">ID: {enquiry.id}</p>
      <p className="text-xs text-gray-600 mb-1">📍 {enquiry.area}</p>
      <p className="text-xs text-gray-600 mb-2">⚡ {enquiry.capacity} kW</p>
      
      {enquiry.priority && (
        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
          enquiry.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          enquiry.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          enquiry.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {enquiry.priority}
        </span>
      )}
    </div>
  );
}
