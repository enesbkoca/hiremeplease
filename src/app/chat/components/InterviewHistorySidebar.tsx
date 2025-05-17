'use client';

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Profile from './Profile';
import apiClient from '@/api';

interface InterviewHistorySidebarProps {
  session: Session | null;
}

async function fetchInterviewHistory() {
  try {
    const res = await apiClient.get('/api/fetch');
    console.log("User JWT token:", apiClient.defaults.headers.common['Authorization']);
    return res.data;
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return [];
  }
}

export const InterviewHistorySidebar: React.FC<InterviewHistorySidebarProps> = ({ 
  session 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [interviewHistory, setInterviewHistory] = useState<
    { id: string; title: string; date: string }[]
  >([]);

    useEffect(() => {
    const fetchJob = async () => {
      const res = await fetchInterviewHistory();
      const response = res[1];
      console.log("Interview history response:", response);
      if (response) {
        const formattedData = Array.isArray(response) ? response.map(item => ({
          id: item.id || item.description || String(Math.random()),
          title: item.title || "Untitled Interview",
          date: item.created_at || new Date().toISOString().split('T')[0]
        })) : [];
        
        setInterviewHistory(formattedData);
        console.log("Formatted interview history:", formattedData);
      } else {
        console.error("Failed to fetch interview history");
      }
    };
    fetchJob();
  }, []);

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
