import { notFound } from 'next/navigation';
import {InterviewQuestionsList} from "@/app/components/InterviewQuestionsList";
import {JobDescriptionDisplay} from "@/app/components/JobDescriptionDisplay";

interface Params {
    jobId: string;
}

async function getJobDetails(jobId: string) {
    try {
        const fullUrl = process.env.NEXT_PUBLIC_API_URL + "/api/jobs/" + jobId;
        await new Promise(resolve => setTimeout(resolve, 5000));
        const res = await fetch(fullUrl);

        if (!res.ok) {
            throw new Error(`Failed to fetch job data: ${res.status} ${res.statusText}`);
        }
        return res.json();
    } catch (error) {
        console.error("Error fetching job data:", error);
        return null;
    }
}

export default async function JobPage({ params }: { params: Params }) {
    // Await the params
    const {jobId} = await params;

    const jobDetails = await getJobDetails(jobId);

    if (!jobDetails) {
        notFound();
    }
    return (
        <div>
            <h1>Job ID: {jobId}</h1>
            {jobDetails && (
                <div>
                    <JobDescriptionDisplay title={jobDetails.title} description={jobDetails.description}/>
                    <div
                        className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[70vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                            <InterviewQuestionsList questions={jobDetails.questions}/>
                        </main>
                    </div>
                </div>
            )}
        </div>
    );
}