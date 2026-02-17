'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Package, Sparkles, CheckCircle } from 'lucide-react';

// Predefined Material Database
const MATERIAL_DATABASE = [
  { name: "PANEL DCR 580W", uom: "nos", category: "Solar Components" },
  { name: "PANEL DCR 650W", uom: "nos", category: "Solar Components" },
  { name: "INVERTER 3KW", uom: "nos", category: "Solar Components" },
  { name: "INVERTER 5KW", uom: "nos", category: "Solar Components" },
  { name: "INVERTER 7KW", uom: "nos", category: "Solar Components" },
  { name: "INVERTER 10KW", uom: "nos", category: "Solar Components" },
  { name: "DCDB 1-6KW", uom: "nos", category: "Solar Components" },
  { name: "ACDB 1-6KW", uom: "nos", category: "Solar Components" },
  { name: "DC CABLE 4mm", uom: "mtr", category: "Cables" },
  { name: "DC CABLE 6mm", uom: "mtr", category: "Cables" },
  { name: "6 SQ MM 1C Cu CABLE", uom: "mtr", category: "Cables" },
  { name: "2.5 SQMM 2C Cu CABLE", uom: "mtr", category: "Cables" },
  { name: "10 SQMM 2C Al CABLE", uom: "mtr", category: "Cables" },
  { name: "RING LUG 6MM", uom: "nos", category: "Accessories" },
  { name: "PIN LUG 6MM", uom: "nos", category: "Accessories" },
  { name: "MC4 CONNECTOR", uom: "nos", category: "Accessories" },
  { name: "EARTHING ROD", uom: "nos", category: "Earthing" },
  { name: "EARTHING BALTI", uom: "nos", category: "Earthing" },
  { name: "LIGHTENING ARRESTER", uom: "nos", category: "Earthing" },
  { name: "EARTHING CHEMICAL 10KG", uom: "bag", category: "Earthing" },
  { name: "PVC PIPE 25MM", uom: "mtr", category: "Conduits" },
  { name: "FLEXIBLE PIPE 25MM", uom: "mtr", category: "Conduits" },
  { name: "ELBOW 25MM", uom: "nos", category: "Conduits" },
  { name: "TEE 25MM", uom: "nos", category: "Conduits" },
  { name: "ELECTRICAL TAPE", uom: "nos", category: "Hardware" },
  { name: "KAJU KHILA 25MM", uom: "pkt", category: "Hardware" },
  { name: "CABLE TIE 300MM", uom: "pkt", category: "Hardware" },
  { name: "P 3540 Structure", uom: "nos", category: "Structure" },
  { name: "R 3850 Structure", uom: "nos", category: "Structure" },
  { name: "M8 BOLT", uom: "nos", category: "Structure" },
  { name: "M12 BOLT", uom: "nos", category: "Structure" },
  { name: "FASTNER", uom: "nos", category: "Structure" },
  { name: "METER BOARD", uom: "nos", category: "Electrical" },
  { name: "MCB 32A", uom: "nos", category: "Electrical" },
  { name: "MCB 40A", uom: "nos", category: "Electrical" },
];

// System Capacity Templates
const CAPACITY_TEMPLATES: Record<string, Array<{ material: string; qty: number }>> = {
  '3': [
    { material: "PANEL DCR 580W", qty: 6 },
    { material: "INVERTER 3KW", qty: 1 },
    { material: "DCDB 1-6KW", qty: 1 },
    { material: "ACDB 1-6KW", qty: 1 },
    { material: "DC CABLE 4mm", qty: 50 },
    { material: "6 SQ MM 1C Cu CABLE", qty: 1 },
    { material: "10 SQMM 2C Al CABLE", qty: 40 },
    { material: "RING LUG 6MM", qty: 6 },
    { material: "MC4 CONNECTOR", qty: 2 },
    { material: "EARTHING ROD", qty: 3 },
    { material: "EARTHING BALTI", qty: 3 },
    { material: "LIGHTENING ARRESTER", qty: 1 },
    { material: "EARTHING CHEMICAL 10KG", qty: 2 },
    { material: "PVC PIPE 25MM", qty: 30 },
    { material: "ELBOW 25MM", qty: 35 },
    { material: "TEE 25MM", qty: 10 },
    { material: "ELECTRICAL TAPE", qty: 4 },
    { material: "CABLE TIE 300MM", qty: 1 },
    { material: "METER BOARD", qty: 1 },
    { material: "MCB 32A", qty: 1 },
    { material: "P 3540 Structure", qty: 4 },
    { material: "R 3850 Structure", qty: 2 },
    { material: "M8 BOLT", qty: 26 },
    { material: "M12 BOLT", qty: 15 },
  ],
  '5': [
    { material: "PANEL DCR 580W", qty: 10 },
    { material: "INVERTER 5KW", qty: 1 },
    { material: "DCDB 1-6KW", qty: 1 },
    { material: "ACDB 1-6KW", qty: 1 },
    { material: "DC CABLE 6mm", qty: 80 },
    { material: "MCB 40A", qty: 1 },
  ],
  '7': [
    { material: "PANEL DCR 580W", qty: 14 },
    { material: "INVERTER 7KW", qty: 1 },
  ],
  '10': [
    { material: "PANEL DCR 580W", qty: 18 },
    { material: "INVERTER 10KW", qty: 1 },
  ],
};

interface MaterialRow {
  id: string;
  material: string;
  uom: string;
  qty: number;
  section: string;
  remarks: string;
}

export default function CreateBOMPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<string>('');
  const [systemCapacity, setSystemCapacity] = useState<string>('3');
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEligibleEnquiries();
  }, []);

  const fetchEligibleEnquiries = async () => {
    try {
      const response = await fetch('/api/enquiries');
      if (!response.ok) throw new Error('Failed to fetch enquiries');
      
      const data = await response.json();
      const eligible = data.filter((enq: any) => 
        (enq.paymentStatus === 'verified' || enq.paymentStatus === 'received')
      );
      
      setEnquiries(eligible);
    } catch (error) {
      console.error('Error fetching enquiries:', error);
    }
  };

  const handleEnquiryChange = (enqId: string) => {
    setSelectedEnquiry(enqId);
    const enquiry = enquiries.find(e => e.id === enqId);
    if (enquiry && enquiry.capacity) {
      const capacity = Math.floor(parseFloat(enquiry.capacity));
      setSystemCapacity(capacity.toString());
    }
  };

  // Import all materials from template
  const importTemplate = () => {
    const template = CAPACITY_TEMPLATES[systemCapacity] || CAPACITY_TEMPLATES['3'];
    
    const newMaterials = template.map((item, idx) => {
      const matInfo = MATERIAL_DATABASE.find(m => m.name === item.material);
      return {
        id: `mat-${Date.now()}-${idx}`,
        material: item.material,
        uom: matInfo?.uom || 'nos',
        qty: item.qty,
        section: matInfo?.category || 'General',
        remarks: '',
      };
    });

    setMaterials(newMaterials);
  };

  // Add single empty row
  const addEmptyRow = () => {
    setMaterials([...materials, {
      id: `mat-${Date.now()}`,
      material: '',
      uom: 'nos',
      qty: 0,
      section: 'General',
      remarks: '',
    }]);
  };

  // Update material row
  const updateMaterial = (id: string, field: keyof MaterialRow, value: any) => {
    setMaterials(prev => prev.map(item => {
      if (item.id === id) {
        // If changing material name, auto-update UOM and section
        if (field === 'material') {
          const matInfo = MATERIAL_DATABASE.find(m => m.name === value);
          return {
            ...item,
            material: value,
            uom: matInfo?.uom || 'nos',
            section: matInfo?.category || 'General',
          };
        }
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Remove row
  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(item => item.id !== id));
  };

  // Submit BOM
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEnquiry) {
      alert('Please select an enquiry');
      return;
    }

    if (materials.length === 0) {
      alert('Please add at least one material');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/bom/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enquiryId: selectedEnquiry,
          systemCapacity,
          materials: materials.map((m, idx) => ({
            sno: idx + 1,
            section: m.section,
            particular: m.material,
            uom: m.uom,
            qty: m.qty,
            rem: m.remarks,
            qtyDispatched: 0,
            qtyUtilized: 0,
            qtyReturned: 0,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create BOM');
      }

      alert('BOM created successfully!');
      router.push('/bom');
    } catch (error: any) {
      console.error('Error creating BOM:', error);
      alert(error.message);
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
            <ArrowLeft size={20} />
            Back to BOM List
          </button>
          <h1 className="text-3xl font-bold text-slate-900">Create Bill of Materials</h1>
          <p className="text-slate-600 mt-1">Generate material checklist for installation</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Enquiry Selection Card */}
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
                  onChange={(e) => handleEnquiryChange(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">-- Choose Enquiry --</option>
                  {enquiries.map((enq) => (
                    <option key={enq.id} value={enq.id}>
                      {enq.id} - {enq.customerName} ({enq.capacity} kW)
                    </option>
                  ))}
                </select>
                {enquiries.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">
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
                  onChange={(e) => setSystemCapacity(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="3">3 kW System</option>
                  <option value="5">5 kW System</option>
                  <option value="7">7 kW System</option>
                  <option value="10">10 kW System</option>
                </select>
              </div>
            </div>

            {selectedEnquiry && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3">
                <CheckCircle className="text-blue-600 mt-0.5 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-900">
                  <strong>Selected:</strong> {enquiries.find(e => e.id === selectedEnquiry)?.customerName}
                  <br />
                  You can import the <strong>{systemCapacity} kW</strong> template or add materials manually.
                </div>
              </div>
            )}
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            <div className="p-4 bg-slate-50/50 border-b flex flex-wrap justify-between items-center gap-4">
              <h2 className="font-bold flex items-center gap-2 text-slate-900">
                <Sparkles size={18} className="text-blue-600" />
                Material Checklist ({materials.length} items)
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={importTemplate}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-md flex items-center gap-2"
                >
                  <Package size={16} />
                  Import {systemCapacity}kW Template
                </button>
                <button
                  type="button"
                  onClick={addEmptyRow}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md"
                >
                  <Plus size={16} />
                  Add Row
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider font-bold border-b-2 border-slate-300">
                  <tr>
                    <th className="px-4 py-4 w-16 text-center">#</th>
                    <th className="px-4 py-4">Material Description</th>
                    <th className="px-4 py-4 w-32">Section</th>
                    <th className="px-4 py-4 w-24 text-center">UOM</th>
                    <th className="px-4 py-4 w-32 text-center">Quantity</th>
                    <th className="px-4 py-4 w-40">Remarks</th>
                    <th className="px-4 py-4 w-16"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {materials.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic">
                        No materials added yet. Click "Import Template" or "Add Row" to start.
                      </td>
                    </tr>
                  )}
                  {materials.map((item, index) => (
                    <tr key={item.id} className="group hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-3 text-center">
                        <span className="text-sm font-bold text-slate-500">{index + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          list={`materials-${item.id}`}
                          value={item.material}
                          onChange={(e) => updateMaterial(item.id, 'material', e.target.value)}
                          placeholder="Type or select material..."
                          className="w-full p-2.5 rounded-lg border border-transparent group-hover:border-slate-200 bg-transparent focus:bg-white focus:ring-2 focus:ring-blue-400 outline-none text-sm text-slate-900"
                        />
                        <datalist id={`materials-${item.id}`}>
                          {MATERIAL_DATABASE.map(mat => (
                            <option key={mat.name} value={mat.name}>{mat.category}</option>
                          ))}
                        </datalist>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.section}
                          onChange={(e) => updateMaterial(item.id, 'section', e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-bold text-slate-500 uppercase bg-slate-100 px-3 py-1.5 rounded-lg">
                          {item.uom}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input
                          type="number"
                          step="0.1"
                          value={item.qty}
                          onChange={(e) => updateMaterial(item.id, 'qty', parseFloat(e.target.value) || 0)}
                          className="w-24 p-2 text-center border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none text-sm text-slate-900"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.remarks}
                          onChange={(e) => updateMaterial(item.id, 'remarks', e.target.value)}
                          placeholder="Optional notes"
                          className="w-full p-2 rounded-lg border border-slate-200 text-sm text-slate-900 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => removeMaterial(item.id)}
                          className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !selectedEnquiry || materials.length === 0}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold shadow-lg shadow-blue-100 transition-all"
            >
              {loading ? (
                <>Processing...</>
              ) : (
                <>
                  <Save size={20} />
                  Create BOM ({materials.length} items)
                </>
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
