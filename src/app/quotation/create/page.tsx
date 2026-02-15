// src/app/quotation/create/page.tsx
'use client';

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, Send, Loader2, Calculator, ArrowLeft, Plus, Minus } from 'lucide-react';
import DemoBanner from '@/components/DemoBanner';
import { useDemoMode } from '@/contexts/DemoContext';

interface ComponentOption {
  make: string;
  model: string;
  wattage?: number;
  warranty: string;
  capacity?: number;
}

const panelOptions: ComponentOption[] = [
  { make: 'WAAREE', model: 'Energetica', wattage: 560, warranty: '30 Years Product Output Warranty' },
  { make: 'WAAREE', model: 'Premium', wattage: 545, warranty: '25 Years Product Output Warranty' },
  { make: 'Adani', model: 'Mono PERC', wattage: 540, warranty: '25 Years Product Output Warranty' },
  { make: 'Vikram Solar', model: 'Eldora', wattage: 550, warranty: '25 Years Product Output Warranty' },
];

const inverterOptions: ComponentOption[] = [
  { make: 'Waaree', model: '3KVA Ongrid 5G Pro-Inverter, 04 MPPT, With Wifi and RMS', capacity: 3, warranty: '8 YEARS' },
  { make: 'Waaree', model: '5KVA Ongrid 5G Pro-Inverter, 04 MPPT, With Wifi and RMS', capacity: 5, warranty: '8 YEARS' },
  { make: 'Waaree', model: '7KVA Ongrid 5G Pro-Inverter, 04 MPPT, With Wifi and RMS', capacity: 7, warranty: '8 YEARS' },
  { make: 'Waaree', model: '10KVA Ongrid 5G Pro-Inverter, 04 MPPT, With Wifi and RMS', capacity: 10, warranty: '10 YEARS' },
  { make: 'Solis', model: '5KW Hybrid Inverter', capacity: 5, warranty: '10 YEARS' },
  { make: 'Growatt', model: '10KW On-Grid Inverter', capacity: 10, warranty: '10 YEARS' },
];

export default function QuotationBuilderPage() {
  const { data: session, status } = useSession();
  const { isDemoMode } = useDemoMode();
  const router = useRouter();
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Lead/Customer
    leadId: leadId || '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    location: '',
    premisesType: 'Residence',

    // System
    systemCapacity: 3,
    systemType: 'On-Grid',
    panelType: 'RTS DCR',

    // Panels
    panelMake: 'WAAREE',
    panelModel: 'Energetica',
    panelWattage: 560,
    panelQuantity: 6,
    panelWarranty: '30 Years Product Output Warranty',

    // Inverter
    inverterMake: 'Waaree',
    inverterModel: '3KVA Ongrid 5G Pro-Inverter, 04 MPPT, With Wifi and RMS',
    inverterCapacity: 3,
    inverterQuantity: 1,
    inverterWarranty: '8 YEARS',

    // Structure
    structureType: 'Hot Dip Galvanized',
    structureMake: 'HOPE ENERGY/KML',
    structureWarranty: '5 YEARS',

    // BOS
    bosItems: 'Balance of System & Accessories - Polycab/Waacab',
    bosWarranty: '5 YEARS',

    // Cables
    cableMake: 'Polycab/Waacab',
    cableWarranty: '5 YEARS',

    // Earthing
    earthingType: 'Chemical Earthing, Strips & Rod - True Power/Onyx',
    earthingQuantity: 3,
    earthingWarranty: '5 YEARS',

    // Lightning Arrestor
    lightningArrestorType: 'Copper Lightning Arrestor Pipe Type - True Power/Onyx',
    lightningArrestorQuantity: 1,
    lightningArrestorWarranty: '5 YEARS',

    // Services
    maintenanceYears: 5,
    gridConnectivityIncluded: true,
    netMeteringIncluded: true,

    // Pricing
    baseCost: 192837,
    gstPercentage: 8.9,
    subsidyAmount: 0,

    // Payment Terms
    advancePercentage: 70,
    preDispatchPercentage: 20,
    preGridPercentage: 10,
    paymentTerms: '70% Advance with PO, 20% before Despatch, 10% before Grid synchronization',

    // Additional
    notes: '',
    termsAndConditions: 'Standard T&C as per company policy',
    loanAvailable: true,
    loanInterestRate: 6.0,

    // Company (auto-filled from session)
    companyName: '',
    companyGst: '',
    companyUdyam: '',
    companyCspdclReg: '',
    companyBankName: '',
    companyAccountNumber: '',
    companyIfsc: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
  });

  useEffect(() => {
    if (status === 'authenticated') {
      fetchLeads();
      autoFillCompanyDetails();
    }
  }, [status]);

  useEffect(() => {
    if (leadId && leads.length > 0) {
      const lead = leads.find(l => l.id === leadId);
      if (lead) {
        selectLead(lead);
      }
    }
  }, [leadId, leads]);

  useEffect(() => {
    calculatePricing();
  }, [
    formData.panelWattage,
    formData.panelQuantity,
    formData.systemCapacity,
    formData.gstPercentage,
    formData.subsidyAmount,
  ]);

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads/list?status=contacted,qualified');
      if (response.ok) {
        const data = await response.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const autoFillCompanyDetails = () => {
    const user = session?.user as any;
    setFormData(prev => ({
      ...prev,
      companyName: user?.organizationName || 'Hope Energy',
      companyEmail: user?.email || '',
    }));
  };

  const selectLead = (lead: any) => {
    setSelectedLead(lead);
    setFormData(prev => ({
      ...prev,
      leadId: lead.id,
      customerName: lead.name,
      customerPhone: lead.phone,
      customerEmail: lead.email || '',
      customerAddress: lead.address || '',
      location: lead.area || lead.location || '',
      systemCapacity: lead.capacity ? parseFloat(lead.capacity) : 3,
    }));
  };

  const calculatePricing = () => {
    const pricePerWatt = 64;
    const systemWatts = formData.systemCapacity * 1000;
    const baseCost = Math.round(systemWatts * pricePerWatt);

    setFormData(prev => ({
      ...prev,
      baseCost,
    }));
  };

  const handlePanelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const panel = panelOptions[parseInt(e.target.value)];
    setFormData(prev => ({
      ...prev,
      panelMake: panel.make,
      panelModel: panel.model,
      panelWattage: panel.wattage || 560,
      panelWarranty: panel.warranty,
    }));
  };

  const handleInverterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const inverter = inverterOptions[parseInt(e.target.value)];
    setFormData(prev => ({
      ...prev,
      inverterMake: inverter.make,
      inverterModel: inverter.model,
      inverterCapacity: inverter.capacity || 3,
      inverterWarranty: inverter.warranty,
    }));
  };

  const calculatePanelQuantity = () => {
    const systemWatts = formData.systemCapacity * 1000;
    const quantity = Math.ceil(systemWatts / formData.panelWattage);
    setFormData(prev => ({ ...prev, panelQuantity: quantity }));
  };

  const handleSubmit = async (e: FormEvent, sendImmediately: boolean = false) => {
    e.preventDefault();

    if (isDemoMode) {
      alert('Demo mode - Cannot create quotation');
      return;
    }

    if (!formData.customerName || !formData.customerPhone) {
      alert('❌ Please fill in customer name and phone');
      return;
    }

    try {
      setLoading(true);

      // Create quotation
      const response = await fetch('/api/quotations/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          referenceNumber: '',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create quotation');
      }

      alert(`✅ Quotation ${data.quotation.quotationId} created successfully!`);

      // If sendImmediately, send the quotation
      if (sendImmediately) {
        const sendResponse = await fetch('/api/quotations/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quotationId: data.quotation.quotationId }),
        });

        if (sendResponse.ok) {
          const sendData = await sendResponse.json();
          alert(`✅ Quotation sent!\n\n📱 Share this link:\n${sendData.publicUrl}`);
        }
      }

      // Redirect to quotation page
      router.push('/quotation');
    } catch (error: any) {
      alert('❌ ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const gstAmount = Math.round(formData.baseCost * (formData.gstPercentage / 100));
  const totalCost = formData.baseCost + gstAmount;
  const finalAmount = totalCost - formData.subsidyAmount;

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DemoBanner />
      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Create Quotation {isDemoMode && <span className="text-blue-600">(Demo)</span>}
            </h1>
            <p className="text-gray-600 mt-1">Build a detailed solar system quotation</p>
          </div>
        </div>

        {/* Lead Selection */}
        {!leadId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Lead (Optional)</h2>
            <select
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
              value={formData.leadId}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                const lead = leads.find(l => l.id === e.target.value);
                if (lead) selectLead(lead);
                else setFormData(prev => ({ ...prev, leadId: '' }));
              }}
            >
              <option value="">-- Create without lead --</option>
              {leads.map(lead => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} - {lead.phone} ({lead.capacity || 'N/A'} kW)
                </option>
              ))}
            </select>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Customer Information */}
          <FormSection title="Customer Information" icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Customer Name *"
                value={formData.customerName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                required
              />
              <InputField
                label="Phone Number *"
                type="tel"
                value={formData.customerPhone}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={formData.customerEmail}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
              <InputField
                label="Location"
                value={formData.location}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  value={formData.customerAddress}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))}
                />
              </div>
              <SelectField
                label="Premises Type"
                value={formData.premisesType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, premisesType: e.target.value }))}
                options={['Residence', 'Commercial', 'Industrial']}
              />
            </div>
          </FormSection>

          {/* System Configuration */}
          <FormSection title="System Configuration" icon="⚡">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  System Capacity (kW) *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, systemCapacity: Math.max(1, prev.systemCapacity - 0.5) }))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.systemCapacity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, systemCapacity: parseFloat(e.target.value) }))}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold text-center"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, systemCapacity: prev.systemCapacity + 0.5 }))}
                    className="p-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              <SelectField
                label="System Type"
                value={formData.systemType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, systemType: e.target.value }))}
                options={['On-Grid', 'Hybrid', 'Off-Grid']}
              />

              <SelectField
                label="Panel Type"
                value={formData.panelType}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFormData(prev => ({ ...prev, panelType: e.target.value }))}
                options={['RTS DCR', 'ALMM', 'Standard']}
              />
            </div>
          </FormSection>

          {/* Panel Selection */}
          <FormSection title="Solar Panels" icon="☀️">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Select Panel</label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
                  onChange={handlePanelChange}
                >
                  {panelOptions.map((panel, idx) => (
                    <option key={idx} value={idx}>
                      {panel.make} {panel.model} ({panel.wattage}Wp)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Panel Quantity</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={formData.panelQuantity}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, panelQuantity: parseInt(e.target.value) }))}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-bold"
                  />
                  <button
                    type="button"
                    onClick={calculatePanelQuantity}
                    className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                    title="Auto-calculate based on system capacity"
                  >
                    <Calculator size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <p className="text-sm font-bold text-gray-900">
                Total Panel Capacity: {((formData.panelWattage * formData.panelQuantity) / 1000).toFixed(2)} kW
              </p>
              <p className="text-sm text-gray-700 mt-1">Warranty: {formData.panelWarranty}</p>
            </div>
          </FormSection>

          {/* Inverter Selection */}
          <FormSection title="Inverter" icon="🔌">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Select Inverter</label>
                <select
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
                  onChange={handleInverterChange}
                >
                  {inverterOptions.map((inv, idx) => (
                    <option key={idx} value={idx}>
                      {inv.make} - {inv.capacity}kVA
                    </option>
                  ))}
                </select>
              </div>

              <InputField
                label="Quantity"
                type="number"
                min="1"
                value={formData.inverterQuantity}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, inverterQuantity: parseInt(e.target.value) }))}
              />
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 mt-4">
              <p className="text-sm font-bold text-gray-900">{formData.inverterModel}</p>
              <p className="text-sm text-gray-700 mt-1">Warranty: {formData.inverterWarranty}</p>
            </div>
          </FormSection>

          {/* Other Components */}
          <FormSection title="Additional Components" icon="🔧">
            <div className="space-y-4">
              <InputField
                label="Mounting Structure"
                value={formData.structureType}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, structureType: e.target.value }))}
              />

              <InputField
                label="Balance of System (BOS)"
                value={formData.bosItems}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, bosItems: e.target.value }))}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Earthing Type"
                  value={formData.earthingType}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, earthingType: e.target.value }))}
                />

                <InputField
                  label="Earthing Quantity"
                  type="number"
                  min="1"
                  value={formData.earthingQuantity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, earthingQuantity: parseInt(e.target.value) }))}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Lightning Arrestor"
                  value={formData.lightningArrestorType}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, lightningArrestorType: e.target.value }))}
                />

                <InputField
                  label="LA Quantity"
                  type="number"
                  min="1"
                  value={formData.lightningArrestorQuantity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, lightningArrestorQuantity: parseInt(e.target.value) }))}
                />
              </div>
            </div>
          </FormSection>

          {/* Pricing */}
          <FormSection title="Pricing" icon="💰">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Base Cost (₹)"
                type="number"
                min="0"
                value={formData.baseCost}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, baseCost: parseInt(e.target.value) }))}
              />

              <InputField
                label="GST (%)"
                type="number"
                step="0.1"
                min="0"
                value={formData.gstPercentage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, gstPercentage: parseFloat(e.target.value) }))}
              />

              <InputField
                label="Subsidy Amount (₹)"
                type="number"
                min="0"
                value={formData.subsidyAmount}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, subsidyAmount: parseInt(e.target.value) }))}
              />

              <InputField
                label="Maintenance Years"
                type="number"
                min="1"
                value={formData.maintenanceYears}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, maintenanceYears: parseInt(e.target.value) }))}
              />
            </div>

            {/* Pricing Summary */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300 rounded-lg p-6 mt-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Cost Summary</h3>
              <div className="space-y-2">
                <PriceRow label="Base Cost" value={formData.baseCost} />
                <PriceRow label={`GST (${formData.gstPercentage}%)`} value={gstAmount} />
                <PriceRow label="Total Cost" value={totalCost} bold />
                {formData.subsidyAmount > 0 && (
                  <PriceRow label="Subsidy" value={-formData.subsidyAmount} color="text-green-600" />
                )}
                <div className="pt-3 border-t-2 border-gray-300">
                  <PriceRow label="Final Amount" value={finalAmount} bold large color="text-green-700" />
                </div>
                <div className="pt-2 text-sm text-gray-700">
                  <p><strong>Price per Watt:</strong> ₹{(finalAmount / (formData.systemCapacity * 1000)).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Payment Terms */}
          <FormSection title="Payment Terms" icon="💳">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <InputField
                label="Advance (%)"
                type="number"
                min="0"
                max="100"
                value={formData.advancePercentage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, advancePercentage: parseInt(e.target.value) }))}
              />

              <InputField
                label="Pre-Dispatch (%)"
                type="number"
                min="0"
                max="100"
                value={formData.preDispatchPercentage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, preDispatchPercentage: parseInt(e.target.value) }))}
              />

              <InputField
                label="Pre-Grid (%)"
                type="number"
                min="0"
                max="100"
                value={formData.preGridPercentage}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, preGridPercentage: parseInt(e.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Payment Terms Description</label>
              <textarea
                rows={3}
                value={formData.paymentTerms}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
              />
            </div>
          </FormSection>

          {/* Notes */}
          <FormSection title="Additional Information" icon="📝">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Internal Notes</label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions or notes..."
                className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              />
            </div>
          </FormSection>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t-2 border-gray-300">
            <button
              type="submit"
              disabled={loading || isDemoMode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save as Draft
                </>
              )}
            </button>

            <button
              type="button"
              onClick={(e: any) => handleSubmit(e, true)}
              disabled={loading || isDemoMode}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 font-bold text-lg disabled:opacity-50"
            >
              <Send size={20} />
              Create & Send
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2 border-b-2 border-gray-300 pb-3">
        <span className="text-2xl">{icon}</span>
        {title}
      </h2>
      {children}
    </div>
  );
}

function InputField({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  required = false, 
  ...props 
}: {
  label: string;
  type?: string;
  value: any;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  [key: string]: any;
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 font-medium"
        {...props}
      />
    </div>
  );
}

function SelectField({ 
  label, 
  value, 
  onChange, 
  options 
}: {
  label: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2">{label}</label>
      <select
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 font-semibold"
      >
        {options.map((opt: string) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

function PriceRow({ label, value, bold = false, large = false, color = 'text-gray-900' }: any) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className={`${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-lg' : 'text-sm'} text-gray-700`}>
        {label}:
      </span>
      <span className={`${bold ? 'font-bold' : 'font-semibold'} ${large ? 'text-2xl' : 'text-base'} ${color}`}>
        ₹{Math.abs(value).toLocaleString('en-IN')}
      </span>
    </div>
  );
}