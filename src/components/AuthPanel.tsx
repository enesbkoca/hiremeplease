'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';
import { useSessionContext } from '@/context/SessionContext';

const AuthPanel: React.FC = () => {
  const router = useRouter();
  const { session } = useSessionContext();


  const handleAuthAction = () => {
    if (session) {
      supabase.auth.signOut();
      router.push('/');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <button 
        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        onClick={handleAuthAction}
      >
        {session ? 'Log Out' : 'Log In'}
      </button>
    </div>
  );
};

export default AuthPanel;