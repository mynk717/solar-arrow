'use client';
import { Plus, Trash2 } from 'lucide-react';
import { BoqItem } from '@/lib/quotations';

interface Props {
  items: BoqItem[];
  onChange: (items: BoqItem[]) => void;
}

export default function BoqEditor({ items, onChange }: Props) {
  const update = (id: string, field: keyof BoqItem, value: any) => {
    onChange(items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitRate') {
        updated.amount = Math.round(Number(updated.quantity) * Number(updated.unitRate));
      }
      return updated;
    }));
  };

  const addRow = () => {
    onChange([...items, {
      id: Date.now().toString(),
      description: '',
      make: '',
      quantity: 1,
      unit: 'Nos',
      unitRate: 0,
      amount: 0,
      warranty: '',
    }]);
  };

  const remove = (id: string) => onChange(items.filter(i => i.id !== id));

  const total = items.reduce((sum, i) => sum + (i.amount || 0), 0);

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-2 py-2 text-left w-6">#</th>
              <th className="px-2 py-2 text-left">Description</th>
              <th className="px-2 py-2 text-left">Make / Spec</th>
              <th className="px-2 py-2 text-center w-16">Qty</th>
              <th className="px-2 py-2 text-center w-16">Unit</th>
              <th className="px-2 py-2 text-right w-24">Rate (₹)</th>
              <th className="px-2 py-2 text-right w-28">Amount (₹)</th>
              <th className="px-2 py-2 text-left w-24">Warranty</th>
              <th className="px-2 py-2 w-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item, idx) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-2 py-1 text-gray-400 text-xs">{idx + 1}</td>
                <td className="px-2 py-1">
                  <input
className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none min-w-[140px] placeholder:text-gray-400"
                    value={item.description}
                    onChange={e => update(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none min-w-[120px] placeholder:text-gray-400"
value={item.make}
                    onChange={e => update(item.id, 'make', e.target.value)}
                    placeholder="Brand / spec"
                  />
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:ring-1 focus:ring-blue-400 outline-none"
                    value={item.quantity}
                    onChange={e => update(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-2 py-1">
                  <select
                    className="w-full border border-gray-200 rounded px-1 py-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none"
                    value={item.unit}
                    onChange={e => update(item.id, 'unit', e.target.value)}
                  >
                    <option>Nos</option>
                    <option>Lot</option>
                    <option>kW</option>
                    <option>Mtr</option>
                    <option>Set</option>
                  </select>
                </td>
                <td className="px-2 py-1">
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-right focus:ring-1 focus:ring-blue-400 outline-none"
                    value={item.unitRate}
                    onChange={e => update(item.id, 'unitRate', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-2 py-1 text-right font-medium text-gray-800 whitespace-nowrap">
                  ₹{(item.amount || 0).toLocaleString('en-IN')}
                </td>
                <td className="px-2 py-1">
                  <input
                    className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-400 outline-none placeholder:text-gray-400"
                    value={item.warranty || ''}
                    onChange={e => update(item.id, 'warranty', e.target.value)}
                    placeholder="e.g. 5 yrs"
                  />
                </td>
                <td className="px-2 py-1">
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    className="text-red-400 hover:text-red-600 transition p-1"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50">
              <td colSpan={6} className="px-2 py-2 text-right font-bold text-gray-700 text-sm">
                BOQ Total:
              </td>
              <td className="px-2 py-2 text-right font-bold text-blue-700 text-base whitespace-nowrap">
                ₹{total.toLocaleString('en-IN')}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium transition"
      >
        <Plus size={15} /> Add Row
      </button>
    </div>
  );
}
