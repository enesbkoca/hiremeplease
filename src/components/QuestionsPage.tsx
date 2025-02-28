'use client';

import {useState, useEffect } from 'react';

import { SpeechTokenProvider } from '@/context/SpeechTokenContext';
import { useLoading } from '@/context/LoadingContext';
import { AllQuestions } from "@/components/AllQuestions";
import { JobDetails } from "@/components/JobDetails";

interface QuestionsResponse {
    status: string;
    description: string;
    speech_token: string;
    results: {
      job_title: string;
      industry: string;
      experience_level: string;
      behavioral_questions: {
        question: string;
        category: string;
        explanation: string;
      }[];
      technical_questions: {
        question: string;
        skill_area: string;
        explanation: string;
      }[];
      additional_notes: string;
    } | null;
}

async function getJobDetails(jobId: string): Promise<QuestionsResponse | null> {
    try {
        const res = await fetch(`/api/jobs/${jobId}`);

        if (!res.ok) {
            return Promise.reject(new Error(`Failed to fetch job data: ${res.status} ${res.statusText}`));
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching job data:", error);
        throw error;
    }
}

export default function QuestionsPage({ jobId }: { jobId: string }) {
    const [jobResponse, setJobResponse] = useState<QuestionsResponse | null>(null);
    const [speechToken, setSpeechToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const { setIsLoading } = useLoading();
    const MAX_RETRIES = 5;
    const POLLING_INTERVAL = 5000;

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isCancelled = false;

        const fetchJob = async () => {
            try {
                const response = await getJobDetails(jobId);
                if (isCancelled) return;
                
                if (!response) {
                    throw new Error("Job not found");
                }

                setJobResponse(response);
                setSpeechToken(response.speech_token);

                if (response.status === "Completed") {
                    setIsLoading(false);
                    return;
                }

                if (response.status === "Error") {
                    throw new Error("Job processing failed");
                }

                // Continue polling if job is still processing
                if (retryCount < MAX_RETRIES) {
                    timeoutId = setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        fetchJob();
                    }, POLLING_INTERVAL);
                } else {
                    throw new Error("Maximum retry attempts reached");
                }
            } catch (err) {
                if (!isCancelled) {
                    setError(err instanceof Error ? err.message : "An unexpected error occurred");
                    setIsLoading(false);
                }
            }
        };

        fetchJob();

        return () => {
            isCancelled = true;
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [jobId, retryCount]);

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-red-700 font-semibold mb-2">Error</h2>
                <p className="text-red-600">{error}</p>
                <button
                    onClick={() => {
                        setError(null);
                        setRetryCount(0);
                        setIsLoading(true);
                    }}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    const jobDetails = jobResponse?.results;

    return (
        <>
            {jobDetails && (
                <div className="mt-8 w-full max-w-3xl rounded-lg border border-gray-200 p-6 shadow-sm">
                    <JobDetails title={jobDetails.job_title} description={jobResponse.description} />

                    <SpeechTokenProvider value={speechToken}>
                        <AllQuestions
                            behavioralQuestions={jobDetails.behavioral_questions}
                            technicalQuestions={jobDetails.technical_questions}
                        />
                    </SpeechTokenProvider>
                </div>
            )}
        </>
    );
}