'use client';

import { useState, useEffect } from 'react';
import { InterviewQuestionsList } from "@/app/components/InterviewQuestionsList";
import { JobDescriptionDisplay } from "@/app/components/JobDescriptionDisplay";
import { Loading } from "@/app/components/Loading";

interface JobResponse {
    status: string;
    description: string;
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;
        let isCancelled = false;

        const fetchJob = async () => {
            try {
                const response = await getJobDetails(jobId);
                if (isCancelled) return;
                if (!response) {
                    setError("Job not found.");
                    setIsLoading(false); // Stop loading if job not found
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
                setIsLoading(false); // Stop loading in case of error
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

    if (isLoading) {
        return <Loading status={jobResponse?.status} />;
    }

    if (!jobResponse) {
        return <div>Job not found</div>
    }

    const jobDetails = jobResponse.results;

    return (
        <>
            {jobDetails && (
                <div className="mt-8 w-full max-w-3xl rounded-lg border border-gray-200 p-6 shadow-sm"> {/* Combined all styles into one div */}
                    <JobDescriptionDisplay title={jobDetails.job_title} description={jobResponse.description} />

                    <InterviewQuestionsList behavioralQuestions={jobDetails.behavioral_questions} technicalQuestions={jobDetails.technical_questions} />
                </div>
            )}
        </>
    );
}