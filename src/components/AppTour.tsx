// src/components/AppTour.tsx
'use client';
import { useEffect } from 'react';
import { driver, type DriveStep } from 'driver.js';
import 'driver.js/dist/driver.css';

// ─── SEGMENT 1: Dashboard ───────────────────────────────────────────────────
export function startDashboardTour() {
  driver({
    showProgress: true,
    progressText: 'Step {{current}} of {{total}}',
    nextBtnText: 'Next →',
    prevBtnText: '← Back',
    doneBtnText: 'Done ✓',
    steps: [
      {
        element: '[data-tour="kpi-leads"]',
        popover: {
          title: '📊 New Leads',
          description: 'Total unassigned prospects. This count updates live. Click to go to the Leads page.',
          side: 'bottom', align: 'start',
        },
      },
      {
        element: '[data-tour="kpi-enquiries"]',
        popover: {
          title: '📁 Active Enquiries',
          description: 'Enquiries currently in the pipeline across Survey, Quotation and Payment stages.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="kpi-live"]',
        popover: {
          title: '⚡ Live Systems',
          description: 'Solar systems that are grid-synced and fully active.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="kpi-value"]',
        popover: {
          title: '💰 Pipeline Value',
          description: 'Total quoted value across all active enquiries in Lakhs (₹).',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="blocked-banner"]',
        popover: {
          title: '🚨 Blocked Enquiries Alert',
          description: 'When any enquiry is blocked, this red banner appears. Click it to filter and view all blocked cases immediately.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="pipeline"]',
        popover: {
          title: '🔄 Installation Pipeline',
          description: 'Every stage of your solar project lifecycle. Row 1 is the main flow. Row 2 shows supporting stages like BOM, Quotation, WCR and Subsidy. Each tile is clickable.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="priority-actions"]',
        popover: {
          title: '⚠️ Priority Actions',
          description: 'Admin/Owner only. Shows blocked, overdue, urgent and high-priority enquiries. Use the Poke button to notify the assigned team member.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="my-tasks"]',
        popover: {
          title: '✅ My Tasks',
          description: 'Your personally assigned enquiries with upcoming action dates. Red = overdue. Click any row to open the enquiry.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="followups"]',
        popover: {
          title: '📞 Pending Follow-ups',
          description: 'Scheduled follow-ups you need to complete. Tap any row to jump to that enquiry. Orange date = next follow-up due.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="bell"]',
        popover: {
          title: '🔔 Notifications (Pokes)',
          description: 'Team pokes land here. Orange bouncing bell = unread messages. Red badge = count. Click to see who poked you and why — with a direct link to the enquiry.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="surveys-approval"]',
        popover: {
          title: '📋 Surveys Awaiting Approval',
          description: 'Admin/Owner only. Surveys submitted by your field team that need your review. Click "Review" to approve or reject.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="quick-actions"]',
        popover: {
          title: '⚡ Quick Actions',
          description: 'Shortcuts to add a new lead, create an enquiry, or open the Kanban board.',
          side: 'top',
        },
      },
    ],
  }).drive();
}

// ─── SEGMENT 2: Leads Page ──────────────────────────────────────────────────
export function startLeadsTour() {
  const d = driver({
    showProgress: true,
    steps: [
      {
        element: '[data-tour="leads-header"]',
        popover: {
          title: '📋 Lead Management',
          description: 'This is Stage 1 of the pipeline. Every prospect starts here before becoming a formal enquiry.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="leads-add-btn"]',
        popover: {
          title: '➕ Add New Lead',
          description: 'Capture a new prospect — name, phone, area, capacity, source. Takes under 30 seconds.',
          side: 'left',
        },
      },
      {
        element: '[data-tour="leads-auto-assign"]',
        popover: {
          title: '🔄 Auto-Assign',
          description: 'Automatically distributes unassigned leads across your team using round-robin logic. Admin only.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="leads-assign-btn"]',
        popover: {
          title: '👤 Bulk Assign',
          description: 'Select multiple leads using checkboxes, then assign them all to a team member in one click.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="leads-funnel"]',
        popover: {
          title: '📊 Lead Funnel',
          description: 'Visual breakdown: New → Assigned → Contacted → Qualified → Converted. Shows conversion rates at each stage.',
          side: 'top',
        },
      },
      {
        element: '[data-tour="leads-filters"]',
        popover: {
          title: '🔍 Filters',
          description: 'Filter by Status (New/Contacted/Qualified), Source (Referral/Walk-in/Website), and Assignee. Use the search bar for name or phone.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="leads-view-toggle"]',
        popover: {
          title: '👁️ View Modes',
          description: 'Switch between Funnel view, List view, and Kanban board view depending on how you like to work.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="leads-list"]',
        popover: {
          title: '📋 Lead Cards',
          description: 'Each card shows name, phone, area, capacity, status badge, and assigned user. Tap to open details.',
          side: 'top',
        },
      },
    ],
  });
  d.drive();
}

// ─── SEGMENT 3: Lead Detail Actions ─────────────────────────────────────────
export function startLeadDetailTour() {
  driver({
    showProgress: true,
    steps: [
      {
        element: '[data-tour="lead-detail-status"]',
        popover: {
          title: '🏷️ Lead Status',
          description: 'Update status as you progress: New → Contacted → Qualified → Converted. Or mark as Lost.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="lead-call-log"]',
        popover: {
          title: '📞 Log a Call',
          description: 'Record every interaction — call outcome, notes, and schedule next follow-up date.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="lead-qualify"]',
        popover: {
          title: '✅ Qualify Lead',
          description: 'Mark this lead as qualified when the customer shows genuine interest and capacity for a solar installation.',
          side: 'bottom',
        },
      },
      {
        element: '[data-tour="lead-convert"]',
        popover: {
          title: '🚀 Convert to Enquiry',
          description: 'This is the key action. It creates a formal Enquiry with status "new" and moves the lead into the full pipeline.',
          side: 'bottom',
        },
      },
    ],
  }).drive();
}
