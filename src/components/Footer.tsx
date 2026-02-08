import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 mt-auto pb-20 md:pb-4">
      {/* pb-20 on mobile (80px) to account for bottom nav bar, pb-4 on desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-gray-900 text-sm">
            © 2026 Solar Arrow. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link 
              href="/privacy" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-gray-900 hover:text-blue-600 text-sm font-medium transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}