'use client';

import { signIn, useSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, User, Loader2 } from 'lucide-react';
import Image from 'next/image';

function LoginForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [isSignUp, setIsSignUp] = useState(false);
  const [loginType, setLoginType] = useState<'admin' | 'user'>('user');
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await signIn('google', { callbackUrl, redirect: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setLoading(false);
      } else if (result?.ok) {
        router.push(callbackUrl);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('Account creation coming soon!');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
        <Loader2 className="animate-spin h-12 w-12 text-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-3 sm:p-5">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>

      <div className={`auth-wrapper bg-white rounded-2xl sm:rounded-3xl shadow-2xl relative overflow-hidden w-full max-w-[900px] min-h-[500px] sm:min-h-[600px] transition-all duration-600 ${isSignUp ? 'panel-active' : ''}`}>
        
        {/* Login Form */}
        <div className={`login-form-box absolute top-0 h-full w-full lg:w-1/2 left-0 z-[2] transition-all duration-600 ${isSignUp ? 'lg:translate-x-full' : ''}`}>
          <div className="bg-white flex items-center justify-center flex-col px-6 sm:px-8 lg:px-12 h-full text-center py-6 sm:py-8 overflow-y-auto">
            {/* Logo */}
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                <img 
                  src="/SA_logo.png" 
                  alt="Logo" 
                  className="w-7 h-7 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Solar Arrow</h1>
            </div>

            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">Sign In</h2>

            {/* Login Type Toggle */}
            <div className="flex rounded-lg bg-gray-100 p-1 mb-3 sm:mb-4 w-full max-w-xs">
              <button
                onClick={() => setLoginType('user')}
                className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors ${
                  loginType === 'user' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                User
              </button>
              <button
                onClick={() => setLoginType('admin')}
                className={`flex-1 py-2 px-2 sm:px-3 rounded-md text-xs font-medium transition-colors ${
                  loginType === 'admin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm w-full max-w-xs">
                {error}
              </div>
            )}

            {/* Google Sign In (Admin only) */}
            {loginType === 'admin' && (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full max-w-xs flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-2.5 px-3 sm:px-4 rounded-xl hover:bg-gray-50 hover:border-blue-500 transition-all disabled:opacity-50 mb-3"
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-xs sm:text-sm">Sign in with Google</span>
                    </>
                  )}
                </button>
                
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Admin login uses Google OAuth for security and Sheet access
                </p>
              </>
            )}

            {/* Email/Password Form (User only) */}
            {loginType === 'user' && (
              <>
                <form onSubmit={handleCredentialsSignIn} className="w-full max-w-xs">
                  <div className="relative w-full mb-3">
                    <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      placeholder="Email"
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm text-gray-600"
                      value={credentials.email}
                      onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="relative w-full mb-3">
                    <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="password"
                      placeholder="Password"
                      className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm text-gray-600"
                      value={credentials.password}
                      onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                      required
                    />
                  </div>

                  <a href="#" className="text-blue-600 text-xs mb-4 block hover:text-indigo-700 transition-colors">
                    Forgot password?
                  </a>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 px-6 sm:px-8 rounded-full uppercase tracking-wider text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Sign In'}
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-3 max-w-xs">
                  Users created by admins login with email/password
                </p>
              </>
            )}

            {/* Demo Link */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Want to explore?{' '}
                <a href="/" className="text-blue-600 hover:text-indigo-700 font-medium">View Demo</a>
              </p>
            </div>

            {/* Mobile Switch */}
            <div className="lg:hidden mt-4">
              <p className="text-gray-600 text-xs mb-2">Don't have an account?</p>
              <button
                type="button"
                onClick={() => setIsSignUp(true)}
                className="bg-transparent border-2 border-blue-600 text-blue-600 py-2 px-6 rounded-full text-sm hover:bg-blue-600 hover:text-white transition-all"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

        {/* Register Form */}
        <div className={`register-form-box absolute top-0 h-full w-full lg:w-1/2 left-0 transition-all duration-600 ${isSignUp ? 'lg:translate-x-full opacity-100 z-[5]' : 'opacity-0 z-[1] lg:block hidden'}`}>
          <div className="bg-white flex items-center justify-center flex-col px-6 sm:px-8 lg:px-12 h-full text-center py-6 sm:py-8">
            <div className="mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
              <div className="bg-blue-600 rounded-lg p-1.5 sm:p-2 w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center">
                <img 
                  src="/SA_logo.png" 
                  alt="Logo" 
                  className="w-7 h-7 sm:w-10 sm:h-10 object-contain"
                />
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Solar Arrow</h1>
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 text-gray-800">Create Account</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 rounded-lg mb-3 sm:mb-4 text-xs sm:text-sm w-full max-w-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="w-full max-w-xs">
              <div className="relative w-full mb-3">
                <User className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Name"
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm text-gray-600"
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                />
              </div>

              <div className="relative w-full mb-3">
                <Mail className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm text-gray-600"
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                />
              </div>

              <div className="relative w-full mb-4">
                <Lock className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl focus:border-blue-500 focus:bg-white transition-all outline-none text-sm text-gray-600"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold py-2.5 px-6 sm:px-8 rounded-full uppercase tracking-wider text-xs sm:text-sm shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Sign Up
              </button>
            </form>

            {/* Mobile Switch */}
            <div className="lg:hidden mt-4">
              <p className="text-gray-600 text-xs mb-2">Already have an account?</p>
              <button
                type="button"
                onClick={() => setIsSignUp(false)}
                className="bg-transparent border-2 border-blue-600 text-blue-600 py-2 px-6 rounded-full text-sm hover:bg-blue-600 hover:text-white transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* Sliding Panel Overlay (Desktop Only) */}
        <div className={`hidden lg:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-600 z-[100] ${isSignUp ? '-translate-x-full' : ''}`}>
          <div className={`bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 relative -left-full h-full w-[200%] transition-transform duration-600 ${isSignUp ? 'translate-x-1/2' : ''}`}>
            {/* Right Panel (Sign In Prompt) */}
            <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 right-0 text-white transition-transform duration-600 ${isSignUp ? 'translate-x-[20%]' : ''}`}>
              <h1 className="text-3xl xl:text-4xl font-bold mb-4">Welcome Back!</h1>
              <p className="text-base xl:text-lg mb-8 opacity-90">Enter your credentials to access your Solar Arrow dashboard</p>
              <button
                onClick={() => setIsSignUp(true)}
                className="bg-transparent border-2 border-white text-white py-3 px-10 xl:px-12 rounded-full uppercase tracking-wider text-sm hover:bg-white/10 transition-all"
              >
                Sign Up
              </button>
            </div>

            {/* Left Panel (Sign Up Prompt) */}
            <div className={`absolute flex items-center justify-center flex-col px-10 text-center top-0 h-full w-1/2 left-0 text-white transition-transform duration-600 ${isSignUp ? '' : '-translate-x-[20%]'}`}>
              <h1 className="text-3xl xl:text-4xl font-bold mb-4">Hello, Friend!</h1>
              <p className="text-base xl:text-lg mb-8 opacity-90">Register with us and start managing your solar projects</p>
              <button
                onClick={() => setIsSignUp(false)}
                className="bg-transparent border-2 border-white text-white py-3 px-10 xl:px-12 rounded-full uppercase tracking-wider text-sm hover:bg-white/10 transition-all"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-600 to-indigo-700">
        <Loader2 className="animate-spin h-12 w-12 text-white" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
