// src/lib/reportUtils.ts
// Shared aggregation functions for all Solar Arrow reports

export interface EnquiryRow {
    id: string;
    customerName: string;
    phone: string;
    email: string;
    address: string;
    area: string;
    capacity: string;
    status: string;
    assignedTo: string;
    panelMake: string;
    inverterMake: string;
    installationTeam: string;
    installationSupervisor: string;
    installationCompletedDate: string;
    earthingDone: string;
    meterNumber: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface LiaisonRow {
    enquiryId: string;
    customerName: string;
    area: string;
    capacity: string;
    meterNumber: string;
    liaisonStage: string;
    createdAt: string;
    updatedAt: string;
    inspectionScheduledDate: string;
    inspectionOfficer: string;
    inspectionDate: string;
    inspectionApproved: string;
    inspectionRejectedReason: string;
    inspectionApprovalDate: string;
    docCoveringLetter: string;
    docEStamp300: string;
    docPpa: string;
    docEStamp50: string;
    docVendorAgreement: string;
    docSolarAppAck: string;
    docFeasibility: string;
    docEToken: string;
    docDcr: string;
    docWcr: string;
    docPlantPhotos: string;
    docKycDocuments: string;
    docWitness1Aadhaar: string;
    docWitness2Aadhaar: string;
    wcrStatus: string;
    wcrSubmittedDate: string;
    wcrApprovedDate: string;
  }
  
  export interface ReportFilters {
    from?: string;
    to?: string;
    dateField?: 'createdAt' | 'installationCompletedDate';
    area?: string;
    status?: string;
    team?: string;
    stuckDays?: number;
  }
  
  const DOC_KEYS = [
    'docCoveringLetter', 'docEStamp300', 'docPpa', 'docEStamp50', 'docVendorAgreement',
    'docSolarAppAck', 'docFeasibility', 'docEToken', 'docDcr', 'docWcr', 'docPlantPhotos',
    'docKycDocuments', 'docWitness1Aadhaar', 'docWitness2Aadhaar',
  ];
  
  // ── Helpers ───────────────────────────────────────────────────────────────────
  
  export function daysBetween(a: string, b: string = new Date().toISOString()): number {
    const d1 = new Date(a).getTime();
    const d2 = new Date(b).getTime();
    if (isNaN(d1) || isNaN(d2)) return 0;
    return Math.floor(Math.abs(d2 - d1) / 86400000);
  }
  
  export function monthKey(dateStr: string): string {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Unknown';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  
  export function filterByDate(rows: EnquiryRow[], filters: ReportFilters): EnquiryRow[] {
    return rows.filter((r) => {
      const field = filters.dateField === 'installationCompletedDate'
        ? r.installationCompletedDate
        : r.createdAt;
      if (!field) return false;
      const d = new Date(field).getTime();
      if (filters.from && d < new Date(filters.from).getTime()) return false;
      if (filters.to && d > new Date(filters.to + 'T23:59:59').getTime()) return false;
      if (filters.area && r.area !== filters.area) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.team && r.installationTeam !== filters.team) return false;
      return true;
    });
  }
  
  // ── 1. Monthly Business Review ────────────────────────────────────────────────
  
  export function monthlyBusinessReview(enquiries: EnquiryRow[], filters: ReportFilters) {
    const filtered = filterByDate(enquiries, filters);
  
    const byMonth: Record<string, {
      month: string;
      total: number;
      completed: number;
      totalKw: number;
      completedKw: number;
      inProgress: number;
    }> = {};
  
    const COMPLETED_STATUSES = [
      'installation-completed',
      'meter-installation-pending',
      'inspection-approved',
    ];
  
    filtered.forEach((r) => {
      const key = monthKey(
        filters.dateField === 'installationCompletedDate'
          ? r.installationCompletedDate
          : r.createdAt
      );
      if (!byMonth[key]) {
        byMonth[key] = { month: key, total: 0, completed: 0, totalKw: 0, completedKw: 0, inProgress: 0 };
      }
      byMonth[key].total++;
      byMonth[key].totalKw += parseFloat(r.capacity) || 0;
      if (COMPLETED_STATUSES.includes(r.status)) {
        byMonth[key].completed++;
        byMonth[key].completedKw += parseFloat(r.capacity) || 0;
      } else {
        byMonth[key].inProgress++;
      }
    });
  
    const rows = Object.values(byMonth)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(r => ({ ...r, totalKw: +r.totalKw.toFixed(2), completedKw: +r.completedKw.toFixed(2) }));
  
    const totalEnquiries = filtered.length;
    const totalKw = filtered.reduce((s, r) => s + (parseFloat(r.capacity) || 0), 0);
    const completed = filtered.filter(r => COMPLETED_STATUSES.includes(r.status)).length;
  
    return {
      kpis: {
        totalEnquiries,
        totalKw: totalKw.toFixed(2) + ' kW',
        completedInstalls: completed,
        conversionRate: totalEnquiries ? ((completed / totalEnquiries) * 100).toFixed(1) + '%' : '0%',
      },
      rows,
    };
  }
  
  // ── 2. Pipeline Funnel ────────────────────────────────────────────────────────
  
  export function pipelineFunnel(enquiries: EnquiryRow[], filters: ReportFilters) {
    const filtered = filterByDate(enquiries, filters);
  
    const STAGES = [
      'new', 'survey-scheduled', 'survey-completed', 'quotation-sent',
      'order-confirmed', 'installation-scheduled', 'installation-in-progress',
      'installation-completed', 'meter-installation-pending', 'inspection-approved',
      'installation-rework-required',
    ];
  
    const counts: Record<string, {
      stage: string; count: number; totalKw: number; totalDays: number;
    }> = {};
    STAGES.forEach(s => counts[s] = { stage: s, count: 0, totalKw: 0, totalDays: 0 });
  
    filtered.forEach((r) => {
      const s = r.status || 'new';
      if (!counts[s]) counts[s] = { stage: s, count: 0, totalKw: 0, totalDays: 0 };
      counts[s].count++;
      counts[s].totalKw += parseFloat(r.capacity) || 0;
      counts[s].totalDays += daysBetween(r.createdAt);
    });
  
    const rows = Object.values(counts)
      .filter(r => r.count > 0)
      .map(r => ({
        stage: r.stage,
        count: r.count,
        totalKw: +r.totalKw.toFixed(2),
        avgDaysInStage: r.count ? Math.round(r.totalDays / r.count) : 0,
      }))
      .sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage));
  
    const bottleneck = [...rows].sort((a, b) => b.avgDaysInStage - a.avgDaysInStage)[0];
  
    return {
      kpis: {
        totalActive: filtered.length,
        totalKw: filtered.reduce((s, r) => s + (parseFloat(r.capacity) || 0), 0).toFixed(2) + ' kW',
        stagesActive: rows.length,
        biggestBottleneck: bottleneck?.stage || 'N/A',
      },
      rows,
    };
  }
  
  // ── 3. Team Performance ───────────────────────────────────────────────────────
  
  export function teamPerformance(enquiries: EnquiryRow[], filters: ReportFilters) {
    const filtered = filterByDate(enquiries, filters).filter(r => r.installationCompletedDate);
  
    const byTeam: Record<string, {
      team: string; jobs: number; totalKw: number; totalDays: number; reworks: number;
    }> = {};
  
    filtered.forEach((r) => {
      const team = r.installationTeam || 'Unassigned';
      if (!byTeam[team]) byTeam[team] = { team, jobs: 0, totalKw: 0, totalDays: 0, reworks: 0 };
      byTeam[team].jobs++;
      byTeam[team].totalKw += parseFloat(r.capacity) || 0;
      byTeam[team].totalDays += daysBetween(r.createdAt, r.installationCompletedDate);
      if (r.status === 'installation-rework-required') byTeam[team].reworks++;
    });
  
    const rows = Object.values(byTeam)
      .map(r => ({
        team: r.team,
        totalJobs: r.jobs,
        totalKw: +r.totalKw.toFixed(2),
        avgCompletionDays: r.jobs ? Math.round(r.totalDays / r.jobs) : 0,
        reworkCount: r.reworks,
        reworkRate: r.jobs ? ((r.reworks / r.jobs) * 100).toFixed(1) + '%' : '0%',
      }))
      .sort((a, b) => b.totalJobs - a.totalJobs);
  
    const bestTeam = [...rows].sort((a, b) => a.avgCompletionDays - b.avgCompletionDays)[0];
  
    return {
      kpis: {
        totalTeams: rows.length,
        totalJobs: filtered.length,
        bestTeam: bestTeam?.team || 'N/A',
        avgCompletionDays: filtered.length
          ? Math.round(filtered.reduce((s, r) => s + daysBetween(r.createdAt, r.installationCompletedDate), 0) / filtered.length)
          : 0,
      },
      rows,
    };
  }
  
  // ── 4. Liaison Aging ──────────────────────────────────────────────────────────
  
  export function liaisonAging(
    enquiries: EnquiryRow[],
    liaisons: LiaisonRow[],
    filters: ReportFilters
  ) {
    const stuckThreshold = filters.stuckDays || 15;
    const liaisonMap = Object.fromEntries(liaisons.map(l => [l.enquiryId, l]));
  
    const rows = enquiries
      .filter(r => r.installationCompletedDate)
      .filter(r => !filters.area || r.area === filters.area)
      .map((r) => {
        const l = liaisonMap[r.id] || {} as LiaisonRow;
        const daysInLiaison = daysBetween(r.installationCompletedDate);
        const docsSubmitted = DOC_KEYS.filter(k => (l as any)[k] === 'submitted').length;
  
        return {
          enquiryId: r.id,
          customerName: r.customerName,
          area: r.area,
          capacityKw: parseFloat(r.capacity) || 0,
          installationCompletedDate: r.installationCompletedDate,
          daysInLiaison,
          liaisonStage: l.liaisonStage || 'pending',
          docsSubmitted,
          docsPending: DOC_KEYS.length - docsSubmitted,
          inspectionScheduled: l.inspectionScheduledDate ? 'Yes' : 'No',
          inspectionApproved: l.inspectionApproved === 'TRUE' ? 'Yes' : 'No',
          stuck: daysInLiaison >= stuckThreshold,
        };
      })
      .sort((a, b) => b.daysInLiaison - a.daysInLiaison);
  
    const stuck = rows.filter(r => r.stuck);
  
    return {
      kpis: {
        totalInLiaison: rows.length,
        stuckCount: stuck.length,
        stuckThreshold: stuckThreshold + ' days',
        avgDaysInLiaison: rows.length
          ? Math.round(rows.reduce((s, r) => s + r.daysInLiaison, 0) / rows.length)
          : 0,
      },
      rows,
    };
  }
  
  // ── 5. Area Analysis ──────────────────────────────────────────────────────────
  
  export function areaAnalysis(
    enquiries: EnquiryRow[],
    liaisons: LiaisonRow[],
    filters: ReportFilters
  ) {
    const filtered = filterByDate(enquiries, filters);
    const approvedSet = new Set(
      liaisons.filter(l => l.inspectionApproved === 'TRUE').map(l => l.enquiryId)
    );
  
    const byArea: Record<string, {
      area: string; enquiries: number; totalKw: number;
      completed: number; completedKw: number; approved: number;
    }> = {};
  
    filtered.forEach((r) => {
      const a = r.area || 'Unknown';
      if (!byArea[a]) byArea[a] = { area: a, enquiries: 0, totalKw: 0, completed: 0, completedKw: 0, approved: 0 };
      byArea[a].enquiries++;
      byArea[a].totalKw += parseFloat(r.capacity) || 0;
      if (r.installationCompletedDate) {
        byArea[a].completed++;
        byArea[a].completedKw += parseFloat(r.capacity) || 0;
      }
      if (approvedSet.has(r.id)) byArea[a].approved++;
    });
  
    const rows = Object.values(byArea)
      .map(r => ({ ...r, totalKw: +r.totalKw.toFixed(2), completedKw: +r.completedKw.toFixed(2) }))
      .sort((a, b) => b.totalKw - a.totalKw);
  
    return {
      kpis: {
        totalAreas: rows.length,
        topAreaByKw: rows[0]?.area || 'N/A',
        totalKw: rows.reduce((s, r) => s + r.totalKw, 0).toFixed(2) + ' kW',
        totalApproved: rows.reduce((s, r) => s + r.approved, 0),
      },
      rows,
    };
  }
  
  // ── 6. Inspection Health ──────────────────────────────────────────────────────
  
  export function inspectionHealth(
    enquiries: EnquiryRow[],
    liaisons: LiaisonRow[],
    filters: ReportFilters
  ) {
    const enqMap = Object.fromEntries(enquiries.map(e => [e.id, e]));
  
    let filtered = liaisons.filter(l => l.inspectionScheduledDate);
    if (filters.from) filtered = filtered.filter(l => new Date(l.inspectionScheduledDate) >= new Date(filters.from!));
    if (filters.to) filtered = filtered.filter(l => new Date(l.inspectionScheduledDate) <= new Date(filters.to! + 'T23:59:59'));
    if (filters.area) filtered = filtered.filter(l => l.area === filters.area);
  
    const rows = filtered.map((l) => {
      const eq = enqMap[l.enquiryId] || {} as EnquiryRow;
      const schedulingLag = eq.installationCompletedDate
        ? daysBetween(eq.installationCompletedDate, l.inspectionScheduledDate)
        : 0;
      const approvalLag = l.inspectionDate && l.inspectionApprovalDate
        ? daysBetween(l.inspectionDate, l.inspectionApprovalDate)
        : null;
  
      return {
        enquiryId: l.enquiryId,
        customerName: l.customerName,
        area: l.area,
        capacityKw: parseFloat(l.capacity) || 0,
        officer: l.inspectionOfficer || 'N/A',
        scheduledDate: l.inspectionScheduledDate,
        inspectionDate: l.inspectionDate || '',
        result: l.inspectionApproved === 'TRUE' ? 'Approved' : l.inspectionApproved === 'FALSE' ? 'Rejected' : 'Pending',
        rejectionReason: l.inspectionRejectedReason || '',
        schedulingLagDays: schedulingLag,
        approvalLagDays: approvalLag !== null ? approvalLag : '-',
      };
    }).sort((a, b) => b.scheduledDate.localeCompare(a.scheduledDate));
  
    const completed = rows.filter(r => r.result !== 'Pending');
    const approved = rows.filter(r => r.result === 'Approved');
    const passRate = completed.length ? ((approved.length / completed.length) * 100).toFixed(1) : '0';
  
    return {
      kpis: {
        totalScheduled: rows.length,
        passRate: passRate + '%',
        avgSchedulingLagDays: rows.length
          ? Math.round(rows.reduce((s, r) => s + (r.schedulingLagDays as number), 0) / rows.length)
          : 0,
        pendingApproval: rows.filter(r => r.result === 'Pending').length,
      },
      rows,
    };
  }
  
  // ── 7. Document Compliance ────────────────────────────────────────────────────
  
  export function documentCompliance(
    enquiries: EnquiryRow[],
    liaisons: LiaisonRow[],
    filters: ReportFilters
  ) {
    const enqMap = Object.fromEntries(enquiries.map(e => [e.id, e]));
    let filtered = liaisons;
    if (filters.area) filtered = filtered.filter(l => l.area === filters.area);
  
    const rows = filtered
      .map((l) => {
        const eq = enqMap[l.enquiryId] || {} as EnquiryRow;
        const submitted = DOC_KEYS.filter(k => (l as any)[k] === 'submitted').length;
        const collected = DOC_KEYS.filter(k => (l as any)[k] === 'collected').length;
        const pending = DOC_KEYS.length - submitted - collected;
        const daysSinceInstall = eq.installationCompletedDate
          ? daysBetween(eq.installationCompletedDate)
          : 0;
  
        return {
          enquiryId: l.enquiryId,
          customerName: l.customerName,
          area: l.area,
          capacityKw: parseFloat(l.capacity) || 0,
          liaisonStage: l.liaisonStage || 'pending',
          docsSubmitted: submitted,
          docsCollected: collected,
          docsPending: pending,
          completionPct: Math.round((submitted / DOC_KEYS.length) * 100) + '%',
          daysSinceInstall,
          blocked: pending > 0 && daysSinceInstall >= (filters.stuckDays || 15),
        };
      })
      .filter(r => {
        if (filters.status === 'complete') return r.docsSubmitted === DOC_KEYS.length;
        if (filters.status === 'partial') return r.docsSubmitted > 0 && r.docsSubmitted < DOC_KEYS.length;
        if (filters.status === 'none') return r.docsSubmitted === 0;
        return true;
      })
      .sort((a, b) => a.docsSubmitted - b.docsSubmitted);
  
    return {
      kpis: {
        totalRecords: rows.length,
        fullyComplete: rows.filter(r => r.docsSubmitted === DOC_KEYS.length).length,
        blocked: rows.filter(r => r.blocked).length,
        avgCompletion: rows.length
          ? Math.round(rows.reduce((s, r) => s + parseInt(r.completionPct), 0) / rows.length) + '%'
          : '0%',
      },
      rows,
    };
  }
  