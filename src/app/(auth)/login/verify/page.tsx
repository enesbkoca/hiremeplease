'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import OtpVerification from '../../../../components/OtpVerification'

// Create a supabase client
const supaURL : string = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supaAnonKey : string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supaURL, supaAnonKey)

export default function OtpPage() {
  const [error] = useState<string | null>(null)
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [isNewUser, setIsNewUser] = useState<boolean>(false);

  useEffect(() => {
    const emailParam = new URLSearchParams(window.location.search).get('email');
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }

    const newUserParam = new URLSearchParams(window.location.search).get('newUser');
    if (newUserParam) {
      setIsNewUser(newUserParam === 'true');
    }

  }, []);

  return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 rounded-xl shadow-lg bg-white border border-gray-100 space-y-6">
          {isNewUser && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r-lg" role="alert">
                <p className="font-semibold">Welcome to Hire Me Please!</p>
                <p className="text-sm">You are signing up for the first time. Verify your email to complete signup.</p>
              </div>
          )}
          <div>
            <h2 className="mt-6 text-center text-2xl font-bold text-indigo-600">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-gray-700">
              Enter the verification code sent to your email address.
            </p>
          </div>
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"> {/* Keep error box */}
                {error}
              </div>
          )}
          <div className="space-y-4">
            <OtpVerification
                email={email}
                onBack={() => router.push('/login')}
                supabase={supabase}
            />
            <div className="text-center mt-2"> {/* Keep text-center and mt-2 */}
              <button
                  onClick={() => router.push('/login')}
                  className="inline-block text-sm font-medium text-indigo-600 hover:text-indigo-800" // Keep back to login button
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
