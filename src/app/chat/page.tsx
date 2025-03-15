'use client';

import { useState, useEffect } from 'react';
import { UserInput } from "@/components/UserInput";
import { supabase } from '@/utils/supabase'
import { Session } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'
import { InterviewHistorySidebar } from './components/InterviewHistorySidebar';

export default function ChatPage() {
    const [jobDescription, setJobDescription] = useState("");
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
            logger.info('Chat Sessionn:', { session })
        })
    }, []);

    // TODO: Implement the logic to wait for the session to be loaded
    // If there is no session, redirect to the login page
    if (!session) {
        return <div>loading..</div>//router.push('/login')
    }

  return (
    <main className="flex gap-6 h-[calc(100vh-200px)]">
      {/* Left Side - Interview History Sidebar */}
      <div className="w-1/4 h-full">
        <InterviewHistorySidebar session={session} />
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
