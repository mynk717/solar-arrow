// src/app/onboard/page.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardPage() {
  const [step, setStep] = useState(1);
  const [orgData, setOrgData] = useState({
    organizationName: '',
    adminName: '',
    adminEmail: ''
  });
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    // Sign in with Google
    const result = await signIn('google', { 
      redirect: false,
      callbackUrl: '/setup'
    });
    
    if (result?.ok) {
      // After Google OAuth, create organization
      await createOrganization();
    }
  };

  const createOrganization = async () => {
    const response = await fetch('/api/organizations/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orgData)
    });

    if (response.ok) {
      router.push('/setup'); // Go to sheet connection
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Create Your Organization
        </h1>

        {step === 1 && (
          <div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Organization Name</label>
              <input
                type="text"
                value={orgData.organizationName}
                onChange={(e) => setOrgData({...orgData, organizationName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="Hope Energy"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={orgData.adminName}
                onChange={(e) => setOrgData({...orgData, adminName: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="John Doe"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-gray-600 mb-6">
              Sign in with your Google account to connect your organization and access Google Sheets.
            </p>

            <button
              onClick={handleGoogleSignIn}
              className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </button>

            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
