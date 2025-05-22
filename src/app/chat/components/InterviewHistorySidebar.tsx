'use client';

import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import Profile from './Profile';
import apiClient from '@/api';

interface InterviewHistorySidebarProps {
  session: Session | null;
}

// Define a type for the formatted interview items
interface InterviewItemGrouped {
  id: string;
  title: string;
  date: string;
  parsedDate: Date; // normalized date to local start of day, for grouping
}

async function fetchJobHistory() {
  try {
    const res = await apiClient.get('/api/fetch');
    console.log("User JWT token:", apiClient.defaults.headers.common['Authorization']);
    return res.data;
  } catch (error) {
    console.error("Error fetching interview history:", error);
    return []; // Return empty array or handle error appropriately
  }
}

// Helper function to group interviews bsaed on date ranges
function groupInterviews(
  interviews: InterviewItemGrouped[]
): Record<string, InterviewItemGrouped[]> {
  const groups: Record<string, InterviewItemGrouped[]> = {};

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to the start of the day in local timezone

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
      // For older items, group by year and month
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
  session 
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [InterviewHistory, setInterviewHistory] = useState<
    Record<string, InterviewItemGrouped[]>
  >({});

  useEffect(() => {
    const fetchAndGroupJobs = async () => {
      const fetchedData = await fetchJobHistory();
      const rawInterviewItems = Array.isArray(fetchedData) && fetchedData.length > 1 ? fetchedData[1] : null;

      if (rawInterviewItems && Array.isArray(rawInterviewItems)) {
        const formattedData: InterviewItemGrouped[] = rawInterviewItems.map(item => {
          const dateValue = item.created_at;
          const dateForParsing = dateValue;
          
          const tempDate = new Date(dateForParsing);

          // Normalize to the start of the day in the local timezone for consistent grouping
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
        });
        
        setInterviewHistory(groupInterviews(formattedData));
      } else {
        console.error("Failed to fetch or parse interview history, or data is not in expected format.");
        setInterviewHistory({});
      }
    };
    fetchAndGroupJobs();
  }, []);

  // Helper to get ordered group keys for rendering
  const getOrderedGroupKeys = (groupedData: Record<string, InterviewItemGrouped[]>): string[] => {
    const predefinedOrder = ["Last 7 Days", "Previous 30 Days"];
    
    const monthYearKeys = Object.keys(groupedData)
      .filter(key => !predefinedOrder.includes(key))
      .sort((a, b) => {
        // Assuming keys are "Month YYYY" e.g. "October 2023"
        // Convert to Date objects for sorting (most recent month first)
        const dateA = new Date(`1 ${a}`); // e.g., "1 October 2023"
        const dateB = new Date(`1 ${b}`);
        return dateB.getTime() - dateA.getTime(); 
      });

    return [
      ...predefinedOrder.filter(key => groupedData[key] && groupedData[key].length > 0),
      ...monthYearKeys // These are already filtered by Object.keys if groups are empty
                       // and sorted. Ensure they also have items for robustness.
                       .filter(key => groupedData[key] && groupedData[key].length > 0)
    ];
  };

  const orderedGroupKeys = getOrderedGroupKeys(InterviewHistory);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 rounded-xl shadow-md border border-gray-100 p-4">
      <h2 className="text-lg font-semibold mb-4">Interview History</h2>
      
      {/* Previous Chats */}
      <div className="flex-grow overflow-y-auto mb-4">
        {orderedGroupKeys.length > 0 ? (
          orderedGroupKeys.map(groupName => (
            <div key={groupName} className="mb-3 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 mb-1.5 px-1 sticky top-0 bg-gray-50 py-1">
                {groupName}
              </h3>
              <ul className="space-y-2">
                {InterviewHistory[groupName].map((item) => (
                  <li 
                    key={item.id} 
                    className="p-3 bg-white rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-gray-200"
                  >
                    <p className="font-medium text-sm text-gray-800">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.date}</p> {/* Displays YYYY-MM-DD */}
                  </li>
                ))}
              </ul>
            </div>
          ))
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
