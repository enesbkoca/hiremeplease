'use client';

import { useState, useEffect } from 'react';
import { InterviewQuestionsList } from "@/app/components/InterviewQuestionsList";
import { JobDescriptionDisplay } from "@/app/components/JobDescriptionDisplay";
import { PacmanLoader } from 'react-spinners';

interface JobResponse {
    status: string;
    results: {
        title: string;
        description: string;
        questions: string;
    } | null;
}

async function getJobDetails(jobId: string): Promise<JobResponse | null> {
    try {
        const fullUrl = process.env.NEXT_PUBLIC_API_URL + "/api/jobs/" + jobId;
        const res = await fetch(fullUrl);
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
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <PacmanLoader color="#36D7B7" size={50} />
                {jobResponse?.status && <p className="mt-4 text-gray-600 font-bold">{jobResponse.status}</p>}
            </div>
        );
    }

    if (!jobResponse) {
        return <div>Job not found</div>
    }

    const jobDetails = jobResponse.results;

    return (
        <>
            {jobDetails && (
                <div className="mt-8 w-full max-w-3xl rounded-lg border border-gray-200 p-6 shadow-sm"> {/* Combined all styles into one div */}
                    <JobDescriptionDisplay title={jobDetails.title} description={jobDetails.description} />
                    <InterviewQuestionsList questions={jobDetails.questions} />
                </div>
            )}
        </>
    );
    }