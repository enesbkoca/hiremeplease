'use client';

import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import Profile from './Profile';

interface InterviewHistorySidebarProps {
  session: Session | null;
}

export const InterviewHistorySidebar: React.FC<InterviewHistorySidebarProps> = ({ 
  session 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Placeholder data for visual purposes
  const interviewHistory = [
    { id: '1', title: 'Frontend Developer Interview', date: '2023-05-15' },
    { id: '2', title: 'Backend Engineer Questions', date: '2023-05-10' },
    { id: '3', title: 'Full Stack Developer', date: '2023-05-01' },
    { id: '4', title: 'Software Engineer Interview', date: '2023-04-25' },
    { id: '5', title: 'DevOps Engineer Questions', date: '2023-04-20' },
    { id: '6', title: 'Data Scientist Interview', date: '2023-04-15' },
    { id: '7', title: 'Product Manager Questions', date: '2023-04-10' },
    { id: '8', title: 'UX Designer Interview', date: '2023-04-05' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl shadow-md border border-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Interview History</h2>
      
      {/* Previous Chats */}
      <div className="flex-grow overflow-y-auto mb-4">
        {interviewHistory.length > 0 ? (
          <ul className="space-y-2">
            {interviewHistory.map((item) => (
              <li 
                key={item.id} 
                className="p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-gray-100"
              >
                <p className="font-medium text-sm">{item.title}</p>
                <p className="text-xs text-gray-500">{item.date}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No interview history yet</p>
        )}
      </div>
      
      {/* Profile Button */}
      <div className="mt-auto">
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg flex items-center justify-center text-white font-medium transition-colors"
        >
          My Profile
        </button>
      </div>
      
      {/* Profile Component */}
      <Profile 
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        session={session}
      />
    </div>
  );
};
