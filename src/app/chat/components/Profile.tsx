'use client';

import { Session } from '@supabase/supabase-js';
import { LogOut } from '@/components/LogOut';

interface ProfileProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}

const Profile: React.FC<ProfileProps> = ({
  isOpen,
  onClose,
  session,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">My Profile</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-gray-500 mb-1">Email address</p>
          <p className="font-medium">{session?.user?.email}</p>
        </div>
        
        {/* Use either the LogOut component or the onAuthAction button, not both */}
        <LogOut />
        
        {/* Removing the redundant button:
        <button 
          className="w-full px-4 py-2 rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          onClick={onAuthAction}
        >
          Log Out
        </button>
        */}
      </div>
    </div>
  );
};

export default Profile;
