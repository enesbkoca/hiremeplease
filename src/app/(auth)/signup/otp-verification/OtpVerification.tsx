import { useState } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'
import { useRouter } from 'next/navigation'

interface OtpVerificationProps {
  email: string
  onBack: () => void
  supabase: SupabaseClient
}

export default function OtpVerification({ email, onBack, supabase }: OtpVerificationProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter();

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    logger.info('Verifying OTP')
    logger.info('Email:', { email })

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'email'
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/profile')
    }
    setLoading(false)
  }

  return (
    <>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}
      <form onSubmit={handleVerifyOTP} className="mt-8 space-y-6">
        <div>
          <label htmlFor="otp" className="sr-only">
            Enter OTP
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-white bg-gray-700 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Enter OTP"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </div>
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-indigo-400 hover:text-indigo-300 text-sm"
          >
            Use different email
          </button>
        </div>
      </form>
    </>
  )
}