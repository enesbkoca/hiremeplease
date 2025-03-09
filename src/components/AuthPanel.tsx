'use client'

import React from 'react';
import { useRouter } from 'next/navigation';

const AuthPanel: React.FC = () => {
  const router = useRouter();
  
  return (
    <div className="flex gap-4 items-center">
      <button 
        className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        onClick={() => router.push('/login')}
      >
        Log In
      </button>
    </div>
  );
};

export default AuthPanel;