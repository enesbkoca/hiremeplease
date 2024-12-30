'use client';

import {useState, useEffect } from 'react';

import { useLoading } from '@/app/context/LoadingContext';
import {Questions} from "@/app/components/Questions";
import {JobDetails} from "@/app/components/JobDetails";

interface JobResponse {
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

async function getJobDetails(jobId: string): Promise<JobResponse | null> {
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

export default function JobDisplay({ jobId }: { jobId: string }) {
    const [jobResponse, setJobResponse] = useState<JobResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { setIsLoading } = useLoading()

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isCancelled = false;

        const fetchJob = async () => {
            try {
                const response = await getJobDetails(jobId);
                if (isCancelled) return;
                if (!response) {
                    setError("Job not found.");
                    setIsLoading(false);
                    return;
                }

                setJobResponse(response);

                if (response.status !== "Completed") {
                    timeoutId = setTimeout(fetchJob, 2000);
                } else {
                    setIsLoading(false);
                }
            } catch (err) {
                setError("Error fetching job.");
                console.error(err);
                setIsLoading(false);
            }
        };

        fetchJob();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            isCancelled = true;
        };
    }, [jobId]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    const jobDetails = jobResponse?.results;

    return (
        <>
            {jobDetails && (
                <div className="mt-8 w-full max-w-3xl rounded-lg border border-gray-200 p-6 shadow-sm">
                    <JobDetails title={jobDetails.job_title} description={jobResponse.description} />
                    <Questions
                        behavioralQuestions={jobDetails.behavioral_questions}
                        technicalQuestions={jobDetails.technical_questions}
                        speechToken={jobResponse.speech_token}
                        region={process.env.NEXT_PUBLIC_SPEECH_REGION as string} />
                </div>
            )}
        </>
    );
}