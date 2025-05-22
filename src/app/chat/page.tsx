'use client';

import { useState, useEffect } from 'react';
import { UserInput } from "@/components/UserInput";
import { useSessionContext } from "@/context/SessionContext";
import { logger } from '@/utils/logger'
import { InterviewHistorySidebar } from './components/InterviewHistorySidebar';
import {useRouter} from "next/navigation";
import LoadingIndicator from "@/components/LoadingIndicator";

export default function ChatPage() {
    const [jobDescription, setJobDescription] = useState("");
    const { user, session, loading: sessionLoading } = useSessionContext();
    const router = useRouter();

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

    // 3. Session exists, render the main content.
    return (
        <main className="flex gap-6 h-[calc(100vh-200px)]">
            {/* Left Side - Interview History Sidebar */}
            <div className="w-1/4 h-full">
                <InterviewHistorySidebar session={session}/>
            </div>

            {/* Right Side - User Input */}
            <div className="w-3/4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-semibold mb-4">Generate Interview Questions</h2>
                <UserInput
                    jobDescription={jobDescription}
                    onJobDescriptionChange={setJobDescription}
                />
            </div>
        </main>
    );
}
