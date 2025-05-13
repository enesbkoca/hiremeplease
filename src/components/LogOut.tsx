'use client'

import { supabase } from '@/utils/supabase'
import { useRouter } from 'next/navigation'

export const LogOut: React.FC = () => {
    const router = useRouter();

    // Sign out functionality
    const handleSignOut = () => {
        supabase.auth.signOut()
        router.push('/')
    }

    return (
        <button
            onClick={handleSignOut}
            className="w-full px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
            Sign Out
        </button>
    )
}