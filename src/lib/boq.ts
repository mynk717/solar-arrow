import { BoqItem } from './quotations';

export function generateDefaultBoq(
  panelMake: string,
  panelWattage: number,
  panelQuantity: number,
  inverterMake: string,
  inverterCapacity: number,
  systemCapacity: number,
  finalAmount: number
): BoqItem[] {
  const panelCost    = Math.round(finalAmount * 0.45);
  const inverterCost = Math.round(finalAmount * 0.20);
  const structCost   = Math.round(finalAmount * 0.10);
  const cableCost    = Math.round(finalAmount * 0.07);
  const earthCost    = Math.round(finalAmount * 0.03);
  const laborCost    = Math.round(finalAmount * 0.10);
  const miscCost     = finalAmount - panelCost - inverterCost - structCost - cableCost - earthCost - laborCost;

  return [
    {
      id: '1',
      description: 'Solar PV Modules',
      make: `${panelMake} ${panelWattage}W`,
      quantity: panelQuantity,
      unit: 'Nos',
      unitRate: panelQuantity > 0 ? Math.round(panelCost / panelQuantity) : 0,
      amount: panelCost,
      warranty: '25 years performance',
    },
    {
      id: '2',
      description: 'Grid-Tied Inverter',
      make: `${inverterMake} ${inverterCapacity}kVA`,
      quantity: 1,
      unit: 'Nos',
      unitRate: inverterCost,
      amount: inverterCost,
      warranty: '5 years',
    },
    {
      id: '3',
      description: 'Mounting Structure (GI)',
      make: 'As per site',
      quantity: systemCapacity,
      unit: 'kW',
      unitRate: systemCapacity > 0 ? Math.round(structCost / systemCapacity) : 0,
      amount: structCost,
      warranty: '10 years',
    },
    {
      id: '4',
      description: 'DC / AC Cabling & Protection',
      make: 'Polycab / Havells',
      quantity: 1,
      unit: 'Lot',
      unitRate: cableCost,
      amount: cableCost,
      warranty: '2 years',
    },
    {
      id: '5',
      description: 'Earthing & Lightning Protection',
      make: 'As per IS standard',
      quantity: 1,
      unit: 'Lot',
      unitRate: earthCost,
      amount: earthCost,
      warranty: '2 years',
    },
    {
      id: '6',
      description: 'Installation & Commissioning',
      make: 'Skilled Labour',
      quantity: 1,
      unit: 'Lot',
      unitRate: laborCost,
      amount: laborCost,
      warranty: '',
    },
    {
      id: '7',
      description: 'Miscellaneous & Accessories',
      make: '',
      quantity: 1,
      unit: 'Lot',
      unitRate: miscCost,
      amount: miscCost,
      warranty: '',
    },
  ];
}
