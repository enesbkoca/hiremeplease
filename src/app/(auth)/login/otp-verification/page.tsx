'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import OtpVerification from './OtpVerification'

// Create a supabase client
const supaURL : string = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supaAnonKey : string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supaURL, supaAnonKey)

export default function OtpPage() {
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    const emailParam = new URLSearchParams(window.location.search).get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Verify your OTP
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        <OtpVerification email={email} onBack={() => router.push('/login')} supabase={supabase} />
      </div>
    </div>
  )
}
