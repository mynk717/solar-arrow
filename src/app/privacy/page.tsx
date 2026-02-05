export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto p-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <p className="text-gray-700 mb-8">Last updated: February 5, 2026</p>
      
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">About Solar Arrow</h2>
        <p className="text-gray-900 mb-4">
          Solar Arrow is a project management application for solar energy companies. 
          We help you manage customer enquiries, installations, and project tracking using Google Sheets as your database.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
        <p className="text-gray-900 mb-4">When you use Solar Arrow, we collect and process:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li><strong>Google Account Information:</strong> Your email address, name, and profile picture (for authentication)</li>
          <li><strong>Google Sheets Data:</strong> Content you create and store in your Google Sheets through our app</li>
          <li><strong>Project Data:</strong> Customer enquiries, installation details, and project information you enter</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Data</h2>
        <p className="text-gray-900 mb-4">We use your information to:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Authenticate your identity using Google OAuth</li>
          <li>Read and write data to your Google Sheets for project management</li>
          <li>Store your solar project and customer data in your own Google Sheets</li>
          <li>Provide our solar project management features</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Google API Services Disclosure</h2>
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
          <p className="text-gray-900 mb-2">
            <strong>Important:</strong> Solar Arrow's use and transfer of information received from Google APIs 
            to any other app will adhere to{' '}
            <a 
              href="https://developers.google.com/terms/api-services-user-data-policy" 
              target="_blank"
              className="text-blue-600 hover:underline font-semibold"
            >
              Google API Services User Data Policy
            </a>, including the Limited Use requirements.
          </p>
        </div>
        <p className="text-gray-900 mb-4">Specifically:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>We only access Google Sheets you explicitly authorize</li>
          <li>We do not sell your Google data to third parties</li>
          <li>We do not use your Google data for advertising purposes</li>
          <li>We only use your data to provide Solar Arrow services</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Storage and Security</h2>
        <p className="text-gray-900 mb-4">
          Your project data is stored in <strong>your own Google Sheets</strong> under your Google account. 
          We store only authentication tokens (encrypted) and basic session information in our secure Redis database.
        </p>
        <p className="text-gray-900 mb-4">We use industry-standard security measures including:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>HTTPS encryption for all data transmission</li>
          <li>Encrypted storage of OAuth tokens</li>
          <li>Secure authentication via Google OAuth 2.0</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
        <p className="text-gray-900 mb-4">You have the right to:</p>
        <ul className="list-disc ml-6 mb-4 space-y-2 text-gray-900">
          <li>Revoke Solar Arrow's access to your Google account at any time via{' '}
            <a href="https://myaccount.google.com/permissions" target="_blank" className="text-blue-600 hover:underline">
              Google Account Permissions
            </a>
          </li>
          <li>Delete your data from our systems by contacting support</li>
          <li>Export your data (already in your Google Sheets)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
        <p className="text-gray-900 mb-4">Solar Arrow integrates with:</p>
        <ul className="list-disc ml-6 mb-4 text-gray-900">
          <li><strong>Google Sheets API</strong> - for data storage</li>
          <li><strong>Google Drive API</strong> - for sheet management</li>
        </ul>
        <p className="text-gray-900">Your use of these services is also subject to Google's privacy policies.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
        <p className="text-gray-900 mb-2">If you have questions about this privacy policy:</p>
        <p className="text-gray-900 mb-2"><strong>Email:</strong> shukla.mayank247@gmail.com</p>
        <p className="text-gray-900 mb-2"><strong>App:</strong> Solar Arrow by Marketing Dime</p>
        <p className="text-gray-900"><strong>Website:</strong> <a href="https://sa.mktgdime.com" className="text-blue-600 hover:underline">sa.mktgdime.com</a></p>
      </section>
    </div>
  )
}
