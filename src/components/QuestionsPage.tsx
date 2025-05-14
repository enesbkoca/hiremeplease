'use client';

import {useState, useEffect } from 'react';
import { SpeechTokenProvider } from '@/context/SpeechTokenContext';
import { useLoading } from '@/context/LoadingContext';
import { AllQuestions } from "@/components/AllQuestions";
import { JobDetails } from "@/components/JobDetails";
import { logger } from '@/utils/logger';

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
        logger.debug(`Fetching job details for ID: ${jobId}`);
        const res = await fetch(`/api/jobs/${jobId}`);

        if (!res.ok) {
            logger.error(`Failed to fetch job data: ${res.status} ${res.statusText}`);
            return Promise.reject(new Error(`Failed to fetch job data: ${res.status} ${res.statusText}`));
        }
        
        const data = await res.json();
        logger.info(`Successfully fetched job details for ID: ${jobId}`);
        return data;
    } catch (error) {
        logger.error("Error fetching job data:", { error });
        throw error;
    }
}

export default function QuestionsPage({ jobId }: { jobId: string }) {
    const [jobResponse, setJobResponse] = useState<QuestionsResponse | null>(null);
    const [speechToken, setSpeechToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { setIsLoading } = useLoading();

    useEffect(() => {
        // Start with loading state active
        setIsLoading(true);
        let timeoutId: NodeJS.Timeout | null = null;
        let isCancelled = false;

        const fetchJob = async () => {
            try {
                logger.debug(`Polling job status for ID: ${jobId}`);
                const response = await getJobDetails(jobId);
                
                if (isCancelled) return;
                
                if (!response) {
                    logger.error(`Job not found for ID: ${jobId}`);
                    setError("Job not found.");
                    setIsLoading(false);
                    return;
                }

                setJobResponse(response);
                setSpeechToken(response.speech_token);

                if (response.status !== "completed") {
                    logger.info(`Job ${jobId} still processing, scheduling next poll`);
                    timeoutId = setTimeout(fetchJob, 2000);
                } else {
                    logger.info(`Job ${jobId} completed successfully`);
                    setIsLoading(false);
                }
            } catch (err) {
                logger.error("Error in job polling:", { error: err });
                setError("Error fetching job.");
                setIsLoading(false);
            }
        };

        fetchJob();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            isCancelled = true;
            // Make sure to reset loading state on unmount
            setIsLoading(false);
        };
    }, [jobId, setIsLoading]);

    if (error) {
        logger.warn(`Rendering error state: ${error}`);
        return <div>Error: {error}</div>;
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