'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Package, Sparkles, CheckCircle, ChevronDown } from 'lucide-react';

// ── Material Catalogue ────────────────────────────────────────────────────────
// Structure: Category → Particular → { specs[], uom }
const MATERIAL_CATALOGUE: Record<string, Record<string, { specs: string[]; uom: string }>> = {
  'Solar Panel': {
    'Panel DCR': { specs: ['540W', '550W', '560W', '580W', '600W', '650W'], uom: 'nos' },
    'Panel Non-DCR': { specs: ['540W', '550W', '580W'], uom: 'nos' },
  },
  'Inverter': {
    'Solar Inverter': { specs: ['1KW', '2KW', '3KW', '5KW', '7KW', '8KW', '10KW', '15KW', '20KW'], uom: 'nos' },
    'Hybrid Inverter': { specs: ['3KW', '5KW', '8KW', '10KW'], uom: 'nos' },
  },
  'Protection Box': {
    'DCDB': { specs: ['1-6KW', '6-10KW', '10-20KW'], uom: 'nos' },
    'ACDB': { specs: ['1-6KW', '6-10KW', '10-20KW'], uom: 'nos' },
    'DCDB+ACDB Combo': { specs: ['1-6KW', '6-10KW'], uom: 'nos' },
  },
  'DC Cable': {
    'DC Cable': { specs: ['4mm', '6mm'], uom: 'mtr' },
  },
  'AC Cable': {
    'Cu Single Core': { specs: ['4 SQMM', '6 SQMM', '10 SQMM', '16 SQMM'], uom: 'mtr' },
    'Cu Multi Core': { specs: ['2.5 SQMM 2C', '4 SQMM 2C', '6 SQMM 3C'], uom: 'mtr' },
    'Al Cable': { specs: ['10 SQMM 2C', '16 SQMM 2C', '25 SQMM 2C'], uom: 'mtr' },
  },
  'Lugs & Connectors': {
    'Ring Lug': { specs: ['4MM', '6MM', '10MM', '16MM'], uom: 'nos' },
    'Pin Lug': { specs: ['4MM', '6MM', '10MM'], uom: 'nos' },
    'MC4 Connector': { specs: ['Standard', 'T-Branch'], uom: 'nos' },
    'Ferrule': { specs: ['2.5MM', '4MM', '6MM'], uom: 'nos' },
  },
  'Earthing': {
    'Earthing Rod': { specs: ['3 Feet', '5 Feet', '8 Feet'], uom: 'nos' },
    'Earthing Balti': { specs: ['Standard'], uom: 'nos' },
    'Lightning Arrester': { specs: ['Standard'], uom: 'nos' },
    'Earthing Chemical': { specs: ['5KG', '10KG'], uom: 'bag' },
    'GI Wire': { specs: ['8 SWG', '10 SWG'], uom: 'mtr' },
  },
  'Conduit': {
    'PVC Pipe': { specs: ['20MM', '25MM', '32MM'], uom: 'mtr' },
    'Flexible Pipe': { specs: ['20MM', '25MM', '32MM'], uom: 'mtr' },
    'Elbow': { specs: ['20MM', '25MM', '32MM'], uom: 'nos' },
    'Tee': { specs: ['20MM', '25MM', '32MM'], uom: 'nos' },
    'Saddle Clip': { specs: ['20MM', '25MM'], uom: 'nos' },
  },
  'Hardware': {
    'Electrical Tape': { specs: ['Standard'], uom: 'nos' },
    'Kaju Khila': { specs: ['25MM', '32MM'], uom: 'pkt' },
    'Cable Tie': { specs: ['200MM', '300MM'], uom: 'pkt' },
    'Nut Bolt': { specs: ['M6', 'M8', 'M10', 'M12'], uom: 'nos' },
    'Washer': { specs: ['M6', 'M8', 'M10', 'M12'], uom: 'nos' },
  },
  'Structure': {
    'GI Channel': { specs: ['P 3540', 'R 3850', 'C Channel 50x50'], uom: 'nos' },
    'MS Angle': { specs: ['25x25x3', '40x40x4', '50x50x5'], uom: 'nos' },
    'Fastener Kit': { specs: ['Standard', 'Heavy Duty'], uom: 'set' },
    'Roof Hook': { specs: ['Flat Roof', 'Slant Roof'], uom: 'nos' },
    'Module Clamp': { specs: ['Mid Clamp', 'End Clamp'], uom: 'nos' },
  },
  'Electrical': {
    'Meter Board': { specs: ['Standard', 'Outdoor'], uom: 'nos' },
    'MCB': { specs: ['6A', '10A', '16A', '20A', '25A', '32A', '40A', '63A'], uom: 'nos' },
    'MCCB': { specs: ['32A', '63A', '100A'], uom: 'nos' },
    'RCCB': { specs: ['25A/30mA', '40A/30mA', '63A/30mA'], uom: 'nos' },
    'Isolator': { specs: ['32A', '63A', '100A'], uom: 'nos' },
  },
  'Battery (Optional)': {
    'Lithium Battery': { specs: ['5KWh', '10KWh', '20KWh'], uom: 'nos' },
    'Lead Acid Battery': { specs: ['100Ah', '150Ah', '200Ah'], uom: 'nos' },
  },
};

// ── Default 3kW Template ──────────────────────────────────────────────────────
// particular = "Category > Particular > Spec" for display
const TEMPLATES: Record<string, Array<{
  category: string; particular: string; spec: string; qty: number; remarks?: string;
}>> = {
  '3': [
    { category: 'Solar Panel',        particular: 'Panel DCR',      spec: '580W',       qty: 6 },
    { category: 'Inverter',           particular: 'Solar Inverter',  spec: '3KW',        qty: 1 },
    { category: 'Protection Box',     particular: 'DCDB',            spec: '1-6KW',      qty: 1 },
    { category: 'Protection Box',     particular: 'ACDB',            spec: '1-6KW',      qty: 1 },
    { category: 'DC Cable',           particular: 'DC Cable',        spec: '4mm',        qty: 50 },
    { category: 'AC Cable',           particular: 'Cu Single Core',  spec: '6 SQMM',     qty: 15 },
    { category: 'AC Cable',           particular: 'Al Cable',        spec: '10 SQMM 2C', qty: 40 },
    { category: 'Lugs & Connectors',  particular: 'Ring Lug',        spec: '6MM',        qty: 6 },
    { category: 'Lugs & Connectors',  particular: 'MC4 Connector',   spec: 'Standard',   qty: 4 },
    { category: 'Earthing',           particular: 'Earthing Rod',    spec: '5 Feet',     qty: 3 },
    { category: 'Earthing',           particular: 'Earthing Balti',  spec: 'Standard',   qty: 3 },
    { category: 'Earthing',           particular: 'Lightning Arrester', spec: 'Standard', qty: 1 },
    { category: 'Earthing',           particular: 'Earthing Chemical', spec: '10KG',     qty: 2 },
    { category: 'Conduit',            particular: 'PVC Pipe',        spec: '25MM',       qty: 30 },
    { category: 'Conduit',            particular: 'Elbow',           spec: '25MM',       qty: 35 },
    { category: 'Conduit',            particular: 'Tee',             spec: '25MM',       qty: 10 },
    { category: 'Hardware',           particular: 'Electrical Tape', spec: 'Standard',   qty: 4 },
    { category: 'Hardware',           particular: 'Cable Tie',       spec: '300MM',      qty: 1 },
    { category: 'Electrical',         particular: 'Meter Board',     spec: 'Standard',   qty: 1 },
    { category: 'Electrical',         particular: 'MCB',             spec: '32A',        qty: 1 },
    { category: 'Structure',          particular: 'GI Channel',      spec: 'P 3540',     qty: 4 },
    { category: 'Structure',          particular: 'GI Channel',      spec: 'R 3850',     qty: 2 },
    { category: 'Structure',          particular: 'Fastener Kit',    spec: 'Standard',   qty: 1 },
    { category: 'Structure',          particular: 'Module Clamp',    spec: 'Mid Clamp',  qty: 10 },
    { category: 'Structure',          particular: 'Module Clamp',    spec: 'End Clamp',  qty: 6 },
  ],
  '5': [
    { category: 'Solar Panel',    particular: 'Panel DCR',     spec: '580W',  qty: 10 },
    { category: 'Inverter',       particular: 'Solar Inverter', spec: '5KW',  qty: 1 },
    { category: 'Protection Box', particular: 'DCDB',           spec: '1-6KW', qty: 1 },
    { category: 'Protection Box', particular: 'ACDB',           spec: '1-6KW', qty: 1 },
    { category: 'DC Cable',       particular: 'DC Cable',       spec: '6mm',  qty: 80 },
    { category: 'Electrical',     particular: 'MCB',            spec: '40A',  qty: 1 },
    { category: 'Earthing',       particular: 'Earthing Rod',   spec: '5 Feet', qty: 3 },
    { category: 'Earthing',       particular: 'Earthing Chemical', spec: '10KG', qty: 2 },
    { category: 'Structure',      particular: 'GI Channel',     spec: 'P 3540', qty: 6 },
    { category: 'Structure',      particular: 'Fastener Kit',   spec: 'Standard', qty: 1 },
  ],
  '7': [
    { category: 'Solar Panel',    particular: 'Panel DCR',     spec: '580W', qty: 14 },
    { category: 'Inverter',       particular: 'Solar Inverter', spec: '7KW', qty: 1 },
    { category: 'Protection Box', particular: 'DCDB',           spec: '6-10KW', qty: 1 },
    { category: 'Protection Box', particular: 'ACDB',           spec: '6-10KW', qty: 1 },
    { category: 'DC Cable',       particular: 'DC Cable',       spec: '6mm',  qty: 100 },
    { category: 'Electrical',     particular: 'MCB',            spec: '40A',  qty: 1 },
    { category: 'Earthing',       particular: 'Earthing Rod',   spec: '5 Feet', qty: 3 },
    { category: 'Structure',      particular: 'GI Channel',     spec: 'P 3540', qty: 8 },
    { category: 'Structure',      particular: 'Fastener Kit',   spec: 'Standard', qty: 2 },
  ],
  '10': [
    { category: 'Solar Panel',    particular: 'Panel DCR',     spec: '580W', qty: 18 },
    { category: 'Inverter',       particular: 'Solar Inverter', spec: '10KW', qty: 1 },
    { category: 'Protection Box', particular: 'DCDB',           spec: '6-10KW', qty: 1 },
    { category: 'Protection Box', particular: 'ACDB',           spec: '6-10KW', qty: 1 },
    { category: 'DC Cable',       particular: 'DC Cable',       spec: '6mm',  qty: 120 },
    { category: 'Electrical',     particular: 'MCB',            spec: '63A',  qty: 1 },
    { category: 'Earthing',       particular: 'Earthing Rod',   spec: '5 Feet', qty: 4 },
    { category: 'Structure',      particular: 'GI Channel',     spec: 'P 3540', qty: 10 },
    { category: 'Structure',      particular: 'Fastener Kit',   spec: 'Heavy Duty', qty: 2 },
  ],
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface MaterialRow {
  id: string;
  category: string;
  particular: string;
  spec: string;
  uom: string;
  qty: number;
  remarks: string;
}

function buildLabel(category: string, particular: string, spec: string) {
  if (spec === 'Standard') return `${particular}`;
  return `${particular} ${spec}`;
}

function templateToRows(template: typeof TEMPLATES['3']): MaterialRow[] {
  return template.map((item, idx) => {
    const uom = MATERIAL_CATALOGUE[item.category]?.[item.particular]?.uom || 'nos';
    return {
      id: `mat-${Date.now()}-${idx}`,
      category: item.category,
      particular: item.particular,
      spec: item.spec,
      uom,
      qty: item.qty,
      remarks: item.remarks || '',
    };
  });
}

// ── Add Item Row Component ────────────────────────────────────────────────────
function MaterialRowEditor({
  item,
  index,
  onUpdate,
  onRemove,
}: {
  item: MaterialRow;
  index: number;
  onUpdate: (id: string, updated: Partial<MaterialRow>) => void;
  onRemove: (id: string) => void;
}) {
  const categories = Object.keys(MATERIAL_CATALOGUE);
  const particulars = item.category ? Object.keys(MATERIAL_CATALOGUE[item.category] || {}) : [];
  const specs = item.category && item.particular
    ? MATERIAL_CATALOGUE[item.category]?.[item.particular]?.specs || []
    : [];

  const handleCategory = (cat: string) => {
    const firstParticular = Object.keys(MATERIAL_CATALOGUE[cat] || {})[0] || '';
    const firstSpec = MATERIAL_CATALOGUE[cat]?.[firstParticular]?.specs[0] || '';
    const uom = MATERIAL_CATALOGUE[cat]?.[firstParticular]?.uom || 'nos';
    onUpdate(item.id, { category: cat, particular: firstParticular, spec: firstSpec, uom });
  };

  const handleParticular = (part: string) => {
    const firstSpec = MATERIAL_CATALOGUE[item.category]?.[part]?.specs[0] || '';
    const uom = MATERIAL_CATALOGUE[item.category]?.[part]?.uom || 'nos';
    onUpdate(item.id, { particular: part, spec: firstSpec, uom });
  };

  const handleSpec = (spec: string) => {
    onUpdate(item.id, { spec });
  };

  return (
    <tr className="group hover:bg-blue-50/30 transition-colors border-t border-slate-100">
      {/* # */}
      <td className="px-3 py-3 text-center">
        <span className="text-sm font-bold text-slate-400">{index + 1}</span>
      </td>

      {/* Category */}
      <td className="px-3 py-3">
        <div className="relative">
          <select
            value={item.category}
            onChange={e => handleCategory(e.target.value)}
            className="w-full appearance-none px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none"
          >
            <option value="">-- Category --</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      {/* Particular */}
      <td className="px-3 py-3">
        <div className="relative">
          <select
            value={item.particular}
            onChange={e => handleParticular(e.target.value)}
            disabled={!item.category}
            className="w-full appearance-none px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">-- Item --</option>
            {particulars.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      {/* Spec */}
      <td className="px-3 py-3">
        <div className="relative">
          <select
            value={item.spec}
            onChange={e => handleSpec(e.target.value)}
            disabled={!item.particular}
            className="w-full appearance-none px-3 py-2 pr-8 border border-slate-200 rounded-lg text-sm text-slate-900 bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">-- Spec --</option>
            {specs.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <ChevronDown size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none" />
        </div>
      </td>

      {/* UOM */}
      <td className="px-3 py-3 text-center">
        <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-3 py-1.5 rounded-lg">
          {item.uom || '—'}
        </span>
      </td>

      {/* Qty */}
      <td className="px-3 py-3 text-center">
        <input
          type="number"
          step="0.1"
          min="0"
          value={item.qty}
          onChange={e => onUpdate(item.id, { qty: parseFloat(e.target.value) || 0 })}
          className="w-20 p-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm text-slate-900"
        />
      </td>

      {/* Remarks */}
      <td className="px-3 py-3">
        <input
          type="text"
          value={item.remarks}
          onChange={e => onUpdate(item.id, { remarks: e.target.value })}
          placeholder="Optional"
          className="w-full p-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </td>

      {/* Delete */}
      <td className="px-3 py-3 text-right">
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
          title="Remove"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CreateBOMPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState('');
  const [systemCapacity, setSystemCapacity] = useState('3');
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(false);

  // ── Auto-load 3kW template on mount ──
  useEffect(() => {
    setMaterials(templateToRows(TEMPLATES['3']));
    fetchEligibleEnquiries();
  }, []);

  // ── Reload template when capacity changes (ask first if rows exist) ──
  const handleCapacityChange = (cap: string) => {
    setSystemCapacity(cap);
    if (materials.length > 0) {
      const confirmed = window.confirm(
        `Replace current ${materials.length} items with the ${cap}kW template?`
      );
      if (!confirmed) return;
    }
    setMaterials(templateToRows(TEMPLATES[cap] || TEMPLATES['3']));
  };

  const fetchEligibleEnquiries = async () => {
    try {
      const res = await fetch('/api/enquiries');
      if (!res.ok) return;
      const data = await res.json();
      setEnquiries(
        data.filter((e: any) =>
          e.paymentStatus === 'verified' || e.paymentStatus === 'received'
        )
      );
    } catch (err) {
      console.error('Error fetching enquiries:', err);
    }
  };

  const handleEnquiryChange = (enqId: string) => {
    setSelectedEnquiry(enqId);
    const enq = enquiries.find(e => e.id === enqId);
    if (enq?.capacity) {
      const cap = Math.floor(parseFloat(enq.capacity)).toString();
      if (TEMPLATES[cap]) handleCapacityChange(cap);
    }
  };

  const addEmptyRow = () => {
    setMaterials(prev => [...prev, {
      id: `mat-${Date.now()}`,
      category: '',
      particular: '',
      spec: '',
      uom: 'nos',
      qty: 1,
      remarks: '',
    }]);
  };

  const updateMaterial = (id: string, updated: Partial<MaterialRow>) => {
    setMaterials(prev => prev.map(r => r.id === id ? { ...r, ...updated } : r));
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(r => r.id !== id));
  };

  const importTemplate = () => {
    const confirmed = materials.length > 0
      ? window.confirm(`Replace current ${materials.length} items with ${systemCapacity}kW template?`)
      : true;
    if (confirmed) setMaterials(templateToRows(TEMPLATES[systemCapacity] || TEMPLATES['3']));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) { alert('Please select an enquiry'); return; }
    if (materials.length === 0) { alert('Please add at least one material'); return; }

    const incomplete = materials.filter(m => !m.category || !m.particular || !m.spec);
    if (incomplete.length > 0) {
      alert(`${incomplete.length} row(s) are missing Category / Item / Spec. Please complete them.`);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/bom/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: selectedEnquiry,
          systemCapacity,
          materials: materials.map((m, idx) => ({
            sno: idx + 1,
            section: m.category,
            particular: buildLabel(m.category, m.particular, m.spec),
            uom: m.uom,
            qty: m.qty,
            rem: m.remarks,
            qtyDispatched: 0,
            qtyUtilized: 0,
            qtyReturned: 0,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create BOM');
      }

      alert('✅ BOM created successfully!');
      router.push('/bom');
    } catch (err: any) {
      alert('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/bom')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium"
          >
            <ArrowLeft size={20} /> Back to BOM List
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Create Bill of Materials</h1>
          <p className="text-slate-600 mt-1">3kW template loaded by default — change capacity or customise below</p>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Project Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package size={20} className="text-blue-600" />
              Project Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 mb-2 font-medium text-sm">
                  Select Enquiry <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEnquiry}
                  onChange={e => handleEnquiryChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose Enquiry --</option>
                  {enquiries.map(enq => (
                    <option key={enq.id} value={enq.id}>
                      {enq.id} — {enq.customerName} ({enq.capacity} kW)
                    </option>
                  ))}
                </select>
                {enquiries.length === 0 && (
                  <p className="text-xs text-slate-500 mt-2">
                    No eligible enquiries. Payment must be verified first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-700 mb-2 font-medium text-sm">
                  System Capacity <span className="text-red-500">*</span>
                </label>
                <select
                  value={systemCapacity}
                  onChange={e => handleCapacityChange(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="3">3 kW System</option>
                  <option value="5">5 kW System</option>
                  <option value="7">7 kW System</option>
                  <option value="10">10 kW System</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Changing capacity reloads the template items
                </p>
              </div>
            </div>

            {selectedEnquiry && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>{enquiries.find(e => e.id === selectedEnquiry)?.customerName}</strong> selected ·{' '}
                  {systemCapacity}kW template loaded with {materials.length} items.
                  Add, edit or remove items below before saving.
                </div>
              </div>
            )}
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 bg-slate-50 border-b flex flex-wrap justify-between items-center gap-3">
              <h2 className="font-bold flex items-center gap-2 text-slate-900">
                <Sparkles size={18} className="text-blue-600" />
                Material Checklist
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold ml-1">
                  {materials.length} items
                </span>
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={importTemplate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Package size={16} />
                  Reload {systemCapacity}kW Template
                </button>
                <button
                  type="button"
                  onClick={addEmptyRow}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700"
                >
                  <Plus size={16} /> Add Row
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-bold border-b-2 border-slate-300">
                  <tr>
                    <th className="px-3 py-3 w-10 text-center">#</th>
                    <th className="px-3 py-3 w-44">Category</th>
                    <th className="px-3 py-3 w-44">Item / Particular</th>
                    <th className="px-3 py-3 w-36">Spec / Size</th>
                    <th className="px-3 py-3 w-16 text-center">UOM</th>
                    <th className="px-3 py-3 w-24 text-center">Qty</th>
                    <th className="px-3 py-3">Remarks</th>
                    <th className="px-3 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {materials.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic">
                        No materials added yet. Click "Reload Template" or "Add Row".
                      </td>
                    </tr>
                  ) : (
                    materials.map((item, index) => (
                      <MaterialRowEditor
                        key={item.id}
                        item={item}
                        index={index}
                        onUpdate={updateMaterial}
                        onRemove={removeMaterial}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !selectedEnquiry || materials.length === 0}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
            >
              {loading ? 'Processing...' : (
                <><Save size={20} /> Create BOM ({materials.length} items)</>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/bom')}
              className="px-8 bg-slate-200 text-slate-700 py-4 rounded-xl hover:bg-slate-300 font-semibold"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
