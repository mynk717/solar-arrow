'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface EnquiryFormProps {
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function EnquiryForm({ onClose, onSubmit }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    area: '',
    capacity: '3',
  });

  const [errors, setErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: any = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[\d\s-]{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.area.trim()) {
      newErrors.area = 'Area is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const newEnquiry = {
        id: `ENQ${String(Date.now()).slice(-3).padStart(3, '0')}`,
        ...formData,
        status: 'new' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      onSubmit(newEnquiry);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">New Enquiry</h2>
          <button 
            onClick={onClose}
            className="text-gray-900 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900  ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter full name"
                />
                {errors.customerName && (
                  <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+91 98765 43210"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="customer@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Address <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter complete address"
                />
                {errors.address && (
                  <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area/District <span className="text-red-500">*</span>
                </label>
                <select
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 ${
                    errors.area ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select Area</option>
                  <option value="Raipur Urban">Raipur Urban</option>
                  <option value="Bilaspur">Bilaspur</option>
                  <option value="Durg">Durg</option>
                  <option value="Korba">Korba</option>
                  <option value="Rajnandgaon">Rajnandgaon</option>
                  <option value="Raigarh">Raigarh</option>
                  <option value="Dhamtari">Dhamtari</option>
                  <option value="Mahasamund">Mahasamund</option>
                  <option value="Janjgir-Champa">Janjgir-Champa</option>
                </select>
                {errors.area && (
                  <p className="text-red-500 text-sm mt-1">{errors.area}</p>
                )}
              </div>
            </div>
          </div>

          {/* Project Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Capacity <span className="text-red-500">*</span>
              </label>
              <select
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              >
                <option value="1">1 kW</option>
                <option value="2">2 kW</option>
                <option value="3">3 kW (Recommended for home)</option>
                <option value="4">4 kW</option>
                <option value="5">5 kW</option>
                <option value="6">6 kW</option>
                <option value="7">7 kW</option>
                <option value="8">8 kW</option>
                <option value="9">9 kW</option>
                <option value="10">10 kW</option>
              </select>
              
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Estimated Project Cost:</strong> ₹{(parseInt(formData.capacity) * 60000).toLocaleString()}
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Based on ₹60,000 per kW (including installation)
                </p>
              </div>
            </div>
          </div>

          {/* Information Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Information:</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Survey will be scheduled within 3-5 business days</li>
              <li>• Customer must register on CSPDCL portal after survey approval</li>
              <li>• 50% payment will be received from government after registration</li>
              <li>• Installation will begin after payment confirmation</li>
              <li>• Government inspection required before activation</li>
            </ul>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
            >
              Submit Enquiry
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}