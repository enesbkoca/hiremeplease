'use client';

import { useState, useEffect } from 'react';
import { UserInput } from "@/components/UserInput";
import { useSessionContext } from "@/context/SessionContext";
import { logger } from '@/utils/logger'
import { InterviewHistorySidebar } from './components/InterviewHistorySidebar';
import {useRouter} from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";

import QuestionsPage from '@/components/QuestionsPage';

export default function ChatPage() {
    const [jobDescription, setJobDescription] = useState("");
    const { user, session, loading: sessionLoading } = useSessionContext();
    const router = useRouter();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

    // If there is no session, redirect to the login page
    useEffect(() => {
    // Only redirect if session is loaded (sessionLoading is false) AND a session exists
    if (!sessionLoading && !session) {
      logger.info('No user logged in. Redirecting to /login');
      router.push('/login');
    }
  }, [session, sessionLoading, router, user]);


    // 1. Show loading state
    if (sessionLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <LoadingIndicator size={50}/>
            </div>
        );
    }

    // 2. If not loading and no session, user will be redirected.
    //    Render null or a minimal message to prevent main UI flash.
    if (!session) {
        // The useEffect above will handle the redirect.
        // This prevents rendering the main page content if there's no session.
        return (
            <div className="flex justify-center items-center h-[calc(100vh-200px)]">
                <LoadingIndicator size={50}/>
            </div>
        );
    }

    const handleJobSelect = (jobId: string | null) => {
        // Clear job description if going to "New"
        setSelectedJobId(jobId);
        if (jobId === null) {
            setJobDescription("");
        }
    };
  // 3. Session exists, render the main content.
  return (
    <main className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Left Side - Interview History Sidebar */}
      <div className="w-full md:w-[320px] lg:w-[360px] flex-shrink-0 h-1/3 md:h-full">
        {session ? (
            <InterviewHistorySidebar 
                session={session} 
                onJobSelect={handleJobSelect}
                currentJobId={selectedJobId}
            />
        ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl shadow-md border border-gray-100 p-4">
                <p className="text-gray-500">Login to view history.</p>
            </div>
        )}
      </div>
      
      {/* Right Side - User Input or Job Details Display */}
      <div className="flex-grow h-2/3 md:h-full min-w-0"> {/* min-w-0 for flex child text overflow */}
        {session ? (
            selectedJobId ? (
              <QuestionsPage jobId={selectedJobId} />
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-4 md:p-6 border border-gray-200 h-full flex flex-col">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800">Generate New Interview</h2>
                  <UserInput
                      jobDescription={jobDescription}
                      onJobDescriptionChange={setJobDescription}
                  />
              </div>
            )
        ) : (
             <div className="w-full h-full flex items-center justify-center bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                <p className="text-gray-500">Login to create an interview.</p>
            </div>
        )}
      </div>
    </main>
  );
}
