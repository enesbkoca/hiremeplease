// InterviewHistorySidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Profile from './Profile';
import apiClient from '@/api';

interface InterviewHistorySidebarProps {
  session: Session | null;
  onJobSelect: (jobId: string | null) => void;
  currentJobId: string | null;
}

interface InterviewItem {
  id: string;
  title: string;
  date: string;
  parsedDate: Date;
}

async function fetchJobHistory() {
  try {
    const res = await apiClient.get('/api/fetch');
    return res.data; 
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return []; 
  }
}

// Helper function to group interviews bsaed on date ranges
function groupInterviews(
  interviews: InterviewItem[]
): Record<string, InterviewItem[]> {
  const groups: Record<string, InterviewItem[]> = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0); 
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Sort interviews by parsedDate descending (most recent first)
  const sortedInterviews = [...interviews].sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());

  sortedInterviews.forEach(interview => {
    const interviewDate = interview.parsedDate;

    let groupName: string;

    if (interviewDate >= sevenDaysAgo) {
      groupName = "Last 7 Days";
    } else if (interviewDate >= thirtyDaysAgo) {
      groupName = "Previous 30 Days";
    } else {
      groupName = interviewDate.toLocaleString('default', { month: 'long', year: 'numeric' });
    }

    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(interview);
  });
  return groups;
}

export const InterviewHistorySidebar: React.FC<InterviewHistorySidebarProps> = ({ 
  session,
  onJobSelect,
  currentJobId 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [groupedInterviewHistory, setGroupedInterviewHistory] = useState<
    Record<string, InterviewItem[]>
  >({});

  useEffect(() => {
    const fetchAndGroupInterviews = async () => {
      const fetchedData = await fetchJobHistory();
      const rawInterviewItems = Array.isArray(fetchedData) && fetchedData.length > 1 ? fetchedData[1] : null;

      if (rawInterviewItems && Array.isArray(rawInterviewItems)) {
        const formattedData: InterviewItem[] = rawInterviewItems
          .map(item => {
            if (!item.id) { // Ensure item has an ID, which should be the Job ID
                // console.warn("Interview item skipped due to missing ID:", item);
                return null;
            }
            const dateValue = item.created_at;
            const dateForParsing = dateValue || new Date().toISOString();
            const tempDate = new Date(dateForParsing);
            const localStartOfDay = new Date(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
            // Format display date as YYYY-MM-DD
            let displayDate: string;
            const year = tempDate.getFullYear();
            const month = (tempDate.getMonth() + 1).toString().padStart(2, '0');
            const day = tempDate.getDate().toString().padStart(2, '0');
            displayDate = `${year}-${month}-${day}`;
            
            return {
              id: item.id,
              title: item.title,
              date: displayDate,
              parsedDate: localStartOfDay,
            };
          })
          .filter((item): item is InterviewItem => item !== null); // Type guard to filter out nulls
        
        setGroupedInterviewHistory(groupInterviews(formattedData));
      } else {
        setGroupedInterviewHistory({});
      }
    };
    if (session) { // Only fetch if session exists
        fetchAndGroupInterviews();
    } else {
        setGroupedInterviewHistory({}); // Clear history if no session
    }
  }, [session]); // Refetch if session changes (e.g., user logs in/out)

  const getOrderedGroupKeys = (groupedData: Record<string, InterviewItem[]>): string[] => {
    const predefinedOrder = ["Last 7 Days", "Previous 30 Days"];
    const monthYearKeys = Object.keys(groupedData)
      .filter(key => !predefinedOrder.includes(key))
      .sort((a, b) => new Date(`1 ${b}`).getTime() - new Date(`1 ${a}`).getTime());
    return [
      ...predefinedOrder.filter(key => groupedData[key]?.length > 0),
      ...monthYearKeys.filter(key => groupedData[key]?.length > 0)
    ];
  };

  const orderedGroupKeys = getOrderedGroupKeys(groupedInterviewHistory);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl shadow-md border border-gray-100 p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-700">Interview History</h2>
        <button
          onClick={() => onJobSelect(null)} // Signal to show UserInput
          className="px-3 py-1.5 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50"
        >
          + New
        </button>
      </div>
      
      {/* Previous Chats */}
      <div className="flex-grow overflow-y-auto mb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
        {orderedGroupKeys.length > 0 ? (
          orderedGroupKeys.map(groupName => (
            <div key={groupName} className="mb-3 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 mb-1.5 px-1 sticky top-0 bg-gray-50 py-1 z-10">
                {groupName}
              </h3>
              <ul className="space-y-1.5">
                {groupedInterviewHistory[groupName].map((item) => (
                  <li 
                    key={item.id} 
                    onClick={() => onJobSelect(item.id)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-150 ease-in-out border
                                ${currentJobId === item.id 
                                  ? 'bg-indigo-100 border-indigo-400 shadow-sm' 
                                  : 'bg-white hover:bg-indigo-50 hover:border-indigo-200 border-gray-200'}`}
                  >
                    <p 
                        className={`font-medium text-sm truncate ${currentJobId === item.id ? 'text-indigo-700' : 'text-gray-800'}`}
                        title={item.title}
                    >
                        {item.title}
                    </p>
                    <p className="text-xs text-gray-500">{item.date}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm text-center mt-4">No interview history yet. Click "+ New" to begin!</p>
        )}
      </div>
      
      {/* Profile Button */}
      <div className="mt-auto border-t border-gray-200 pt-3">
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