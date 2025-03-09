'use client';

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { UserInput } from "@/components/UserInput";
import { supabase } from '@/utils/supabase'
import { Session } from '@supabase/supabase-js'
import { logger } from '@/utils/logger'

export default function ChatPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [jobDescription, setJobDescription] = useState("");
    const [session, setSession] = useState<Session | null>(null)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            logger.info('Chat Sessionn:', { session })
            setSession(session)
        })
    }, []);

    // TODO: Implement the logic to wait for the session to be loaded
    // If there is no session, redirect to the login page
    if (!session) {
        return <div>loading..</div>//router.push('/login')
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setIsLoading(true);
    
            if (e.currentTarget.elements && "jobDescription" in e.currentTarget.elements) {
                const jobDescriptionElement = e.currentTarget.elements.jobDescription as HTMLTextAreaElement;
                const jobDescriptionValue = jobDescriptionElement.value;
    
                // Send job description to the server
                const response = await fetch("/api/jobs", {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({description: jobDescriptionValue}),
                });
    
                const {jobId} = await response.json();
                router.push(`/job/${jobId}`); // Redirect to the job page
            } else {
                console.error("jobDescription element not found in form.");
                setIsLoading(false);
            }
        };

  return (
    <main>
    {/* Right Side - Input Form */}
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">Generate Interview Questions</h2>
        <UserInput
            jobDescription={jobDescription}
            onJobDescriptionChange={setJobDescription}
            handleSubmit={handleSubmit}
        />
    </div>
    </main>
    );
}
