// src/app/bom/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, AlertCircle } from 'lucide-react';

interface MaterialItem {
  sno: number;
  section: string;
  particular: string;
  uom: string;
  qty: number;
  rem?: string;
}

const MATERIAL_TEMPLATES: Record<string, MaterialItem[]> = {
  '3': [
    { sno: 1, section: '3KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 6 },
    { sno: 2, section: '3KW KIT', particular: 'INVERTER 3KW', uom: 'nos', qty: 1 },
    { sno: 3, section: '3KW KIT', particular: 'DCDB 1-6KW', uom: 'nos', qty: 1, rem: 'PENDING' },
    { sno: 4, section: '3KW KIT', particular: 'ACDB 1-6KW', uom: 'nos', qty: 1 },
    { sno: 5, section: '3KW KIT', particular: 'DC CABLE', uom: 'mtr', qty: 50 },
    { sno: 6, section: '3KW KIT', particular: '6 SQ MM 1C Cu CABLE', uom: 'mtr', qty: 1, rem: 'PENDING' },
    { sno: 7, section: '3KW KIT', particular: '2.5 SQMM 2C Cu CABLE', uom: 'mtr', qty: 1.5 },
    { sno: 8, section: '3KW KIT', particular: '10 SQMM 2C Al. un CABLE', uom: 'mtr', qty: 40 },
    { sno: 9, section: '3KW KIT', particular: 'RING LUG 6MM', uom: 'nos', qty: 6 },
    { sno: 10, section: '3KW KIT', particular: 'PIN LUG 6MM', uom: 'nos', qty: 16 },
    { sno: 11, section: '3KW KIT', particular: 'MC4 CONNECTOR', uom: 'nos', qty: 2 },
    { sno: 12, section: '3KW KIT', particular: 'EARTHING ROD', uom: 'nos', qty: 3 },
    { sno: 13, section: '3KW KIT', particular: 'EARTHING BALTI', uom: 'nos', qty: 3 },
    { sno: 14, section: '3KW KIT', particular: 'LIGHTENING ARRESTER', uom: 'nos', qty: 1 },
    { sno: 15, section: '3KW KIT', particular: 'EARTHING CHEMICAL(10KG)', uom: 'nos', qty: 2 },
    { sno: 16, section: '3KW KIT', particular: 'PVC PIPE 25MM', uom: 'nos', qty: 30 },
    { sno: 17, section: '3KW KIT', particular: 'FLEXIBLE PIPE 25MM', uom: 'mtr', qty: 2 },
    { sno: 18, section: '3KW KIT', particular: 'ELBOW 25MM', uom: 'nos', qty: 35 },
    { sno: 19, section: '3KW KIT', particular: 'TEE 25MM', uom: 'nos', qty: 10 },
    { sno: 20, section: '3KW KIT', particular: 'ELECTRICAL TAPE (RYBB)', uom: 'nos', qty: 4 },
    { sno: 21, section: '3KW KIT', particular: 'KAJU KHILA 25MM (100 pc)', uom: 'pkt', qty: 1 },
    { sno: 22, section: '3KW KIT', particular: 'KAJU KHILA 12MM (100 pc)', uom: 'pkt', qty: 1 },
    { sno: 23, section: '3KW KIT', particular: 'CABLE TIE 300MM', uom: 'pkt', qty: 1 },
    { sno: 24, section: '3KW KIT', particular: 'METER BOARD', uom: 'nos', qty: 1 },
    { sno: 25, section: '3KW KIT', particular: 'MCB', uom: 'nos', qty: 1 },
    { sno: 1, section: 'STRUCTURE', particular: 'P 3540', uom: 'nos', qty: 4, rem: '50/4' },
    { sno: 2, section: 'STRUCTURE', particular: 'R 3850', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 3, section: 'STRUCTURE', particular: 'L 1800', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 4, section: 'STRUCTURE', particular: 'L 2400', uom: 'nos', qty: 2, rem: '75/40' },
    { sno: 5, section: 'STRUCTURE', particular: 'B 2600', uom: 'nos', qty: 2, rem: '50/4' },
    { sno: 6, section: 'STRUCTURE', particular: 'M8', uom: 'nos', qty: 26 },
    { sno: 7, section: 'STRUCTURE', particular: 'M12', uom: 'nos', qty: 15 },
    { sno: 8, section: 'STRUCTURE', particular: 'FASTNER', uom: 'nos', qty: 16 },
  ],
  '5': [
    { sno: 1, section: '5KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 10 },
    { sno: 2, section: '5KW KIT', particular: 'INVERTER 5KW', uom: 'nos', qty: 1 },
    { sno: 3, section: '5KW KIT', particular: 'DCDB 1-6KW', uom: 'nos', qty: 1 },
    { sno: 4, section: '5KW KIT', particular: 'ACDB 1-6KW', uom: 'nos', qty: 1 },
    { sno: 5, section: '5KW KIT', particular: 'DC CABLE', uom: 'mtr', qty: 80 },
    // Add more 5KW items...
  ],
  '7': [
    { sno: 1, section: '7KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 14 },
    { sno: 2, section: '7KW KIT', particular: 'INVERTER 7KW', uom: 'nos', qty: 1 },
    // Add more 7KW items...
  ],
  '10': [
    { sno: 1, section: '10KW KIT', particular: 'PANEL DCR 580W', uom: 'nos', qty: 18 },
    { sno: 2, section: '10KW KIT', particular: 'INVERTER 10KW', uom: 'nos', qty: 1 },
    // Add more 10KW items...
  ],
};

export default function CreateBOMPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<string>('');
  const [systemCapacity, setSystemCapacity] = useState<string>('3');
  const [materials, setMaterials] = useState<MaterialItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEligibleEnquiries();
  }, []);

  useEffect(() => {
    if (systemCapacity) {
      const template = MATERIAL_TEMPLATES[systemCapacity] || MATERIAL_TEMPLATES['3'];
      setMaterials([...template]);
    }
  }, [systemCapacity]);

  const fetchEligibleEnquiries = async () => {
    try {
      // Fetch enquiries where payment is received and BOM not yet created
      const response = await fetch('/api/enquiries');
      if (!response.ok) throw new Error('Failed to fetch enquiries');
      
      const data = await response.json();
      // Filter: payment received, no BOM created yet
      const eligible = data.filter((enq: any) => 
        enq.paymentStatus === 'verified' || enq.paymentStatus === 'received'
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

  const addMaterialRow = () => {
    const lastItem = materials[materials.length - 1];
    const newSno = lastItem ? lastItem.sno + 1 : 1;
    setMaterials([...materials, {
      sno: newSno,
      section: systemCapacity + 'KW KIT',
      particular: '',
      uom: 'nos',
      qty: 0,
      rem: '',
    }]);
  };

  const updateMaterial = (index: number, field: keyof MaterialItem, value: any) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };

  const deleteMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEnquiry) {
      alert('Please select an enquiry');
      return;
    }

    if (materials.length === 0) {
      alert('Please add at least one material item');
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
          customItems: materials,
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/bom')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft size={20} />
            Back to BOM List
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create Bill of Materials</h1>
          <p className="text-gray-600 mt-1">Generate BOM for enquiry after payment received</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Enquiry Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Select Enquiry</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  Enquiry ID <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedEnquiry}
                  onChange={(e) => handleEnquiryChange(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Enquiry --</option>
                  {enquiries.map((enq) => (
                    <option key={enq.id} value={enq.id}>
                      {enq.id} - {enq.customerName} ({enq.capacity} kW)
                    </option>
                  ))}
                </select>
                {enquiries.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No eligible enquiries found. Payment must be received first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">
                  System Capacity <span className="text-red-500">*</span>
                </label>
                <select
                  value={systemCapacity}
                  onChange={(e) => setSystemCapacity(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3">3 kW</option>
                  <option value="5">5 kW</option>
                  <option value="7">7 kW</option>
                  <option value="10">10 kW</option>
                </select>
              </div>
            </div>

            {selectedEnquiry && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-blue-600 mt-0.5" size={20} />
                  <div className="text-sm text-blue-800">
                    <strong>Selected:</strong> {enquiries.find(e => e.id === selectedEnquiry)?.customerName}
                    <br />
                    Material template for <strong>{systemCapacity} kW</strong> system loaded. You can modify quantities below.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Materials Table */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Material Items</h2>
              <button
                type="button"
                onClick={addMaterialRow}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">S.No</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Section</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Particular</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">UOM</th>
                    <th className="px-3 py-3 text-right font-semibold text-gray-700">Qty</th>
                    <th className="px-3 py-3 text-left font-semibold text-gray-700">Remarks</th>
                    <th className="px-3 py-3 text-center font-semibold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {materials.map((material, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          value={material.sno}
                          onChange={(e) => updateMaterial(index, 'sno', parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={material.section}
                          onChange={(e) => updateMaterial(index, 'section', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={material.particular}
                          onChange={(e) => updateMaterial(index, 'particular', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <select
                          value={material.uom}
                          onChange={(e) => updateMaterial(index, 'uom', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="nos">nos</option>
                          <option value="mtr">mtr</option>
                          <option value="pkt">pkt</option>
                          <option value="kg">kg</option>
                          <option value="set">set</option>
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          step="0.1"
                          value={material.qty}
                          onChange={(e) => updateMaterial(index, 'qty', parseFloat(e.target.value))}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="text"
                          value={material.rem || ''}
                          onChange={(e) => updateMaterial(index, 'rem', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => deleteMaterial(index)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {materials.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No materials added. Click "Add Item" to start building BOM.
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Total Items:</strong> {materials.length}
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !selectedEnquiry || materials.length === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating BOM...' : 'Create BOM'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/bom')}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
