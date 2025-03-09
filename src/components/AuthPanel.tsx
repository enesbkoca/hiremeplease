'use client'

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Session } from '@supabase/supabase-js'
import { supabase } from '@/utils/supabase';
import { logger } from '@/utils/logger';

const AuthPanel: React.FC = () => {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      logger.info('Get session:', { session });
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      logger.info('Auth state change:', { event, session });
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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