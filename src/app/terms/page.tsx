export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto p-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Terms of Service</h1>
      <p className="text-gray-700 mb-8">Last updated: February 5, 2026</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceptance of Terms</h2>
        <p className="text-gray-900 mb-4">
          By accessing and using Solar Arrow ("the Service"), you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use the Service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Description</h2>
        <p className="text-gray-900 mb-4">
          Solar Arrow is a project management tool designed for solar energy companies. 
          The Service uses Google Sheets as a backend database to help you manage:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Customer enquiries and leads</li>
          <li>Solar installation projects</li>
          <li>Project tracking and follow-ups</li>
          <li>Payment and subsidy management</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Google Account Integration</h2>
        <p className="text-gray-900 mb-4">
          To use Solar Arrow, you must connect your Google account. By doing so, you authorize us to:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Read and write data to your Google Sheets</li>
          <li>Create and manage spreadsheet files in your Google Drive</li>
          <li>Access your email and profile information for authentication</li>
        </ul>
        <p className="text-gray-900 mb-4">
          You can revoke this access at any time through{' '}
          <a href="https://myaccount.google.com/permissions" target="_blank" className="text-blue-600 hover:underline">
            Google Account Permissions
          </a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
        <p className="text-gray-900 mb-4">You agree to:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Provide accurate information when using the Service</li>
          <li>Maintain the security of your account credentials</li>
          <li>Comply with all applicable laws and regulations</li>
          <li>Use the Service only for legitimate solar business purposes</li>
          <li>Not misuse or attempt to disrupt the Service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Ownership</h2>
        <p className="text-gray-900 mb-4">
          <strong>You own your data.</strong> All project information, customer details, and content you create 
          remain your property. Data is stored in your own Google Sheets under your Google account.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Availability</h2>
        <p className="text-gray-900 mb-4">
          We strive to maintain high availability but do not guarantee uninterrupted service. 
          The Service may be temporarily unavailable due to:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Scheduled maintenance</li>
          <li>Technical issues</li>
          <li>Third-party service disruptions (Google API downtime)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
        <p className="text-gray-900 mb-4">
          Solar Arrow is provided "as is" without warranties of any kind. We are not liable for:
        </p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Loss of data (backup your Google Sheets regularly)</li>
          <li>Business losses or damages</li>
          <li>Issues caused by Google API changes or outages</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Termination</h2>
        <p className="text-gray-900 mb-4">
          You may stop using the Service at any time by revoking access to your Google account. 
          We reserve the right to suspend or terminate accounts that violate these terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
        <p className="text-gray-900 mb-4">
          We may update these terms from time to time. Continued use of the Service after changes 
          constitutes acceptance of the new terms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact</h2>
        <p className="text-gray-900 mb-2">For questions about these terms:</p>
        <p className="text-gray-900 mb-2"><strong>Email:</strong> shukla.mayank247@gmail.com</p>
        <p className="text-gray-900"><strong>Website:</strong> <a href="https://sa.mktgdime.com" className="text-blue-600 hover:underline">sa.mktgdime.com</a></p>
      </section>
    </div>
  )
}
