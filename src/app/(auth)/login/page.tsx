'use client'

import { useState, useEffect } from 'react'
import { Session } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase';

export default function App() {
  // Define state variables
  const [session, setSession] = useState<Session | null>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  // Get the current session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    // Listen for changes in the session
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })


    if (error) {
      setError(error.message)
    } else {
      router.push(`/login/verify?email=${encodeURIComponent(email)}`);
    }
    setLoading(false)
  }

  if (session) {
    router.push('/chat')
    return null
  }

  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white border border-gray-100 space-y-6">
          <div>
            <h2 className="mt-6 text-center text-2xl font-bold text-indigo-600">
              Sign in to Hire Me Please
            </h2>
            <p className="mt-2 text-center text-gray-700">
              Enter your email to sign in or create an account.
            </p>
          </div>
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                {error}
              </div>
          )}
          <form onSubmit={handleSendOTP} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 rounded w-full py-2 px-3 text-gray-500 leading-tight focus:outline-none focus:border-indigo-500"
                  placeholder="Your email address"
              />
            </div>
            <div>
              <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send Verification Code'}
              </button>
            </div>
          </form>
        </div>
      </div>
  )
}