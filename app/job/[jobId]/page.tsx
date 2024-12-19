import { notFound } from 'next/navigation';

interface Params {
    jobId: string;
}

async function getJobDetails(jobId: string) {
    try {
        const fullUrl = process.env.NEXT_PUBLIC_API_URL + "/api/jobs/" + jobId;

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
    const { jobId } = await params;

    const jobDetails = await getJobDetails(jobId);
    console.log("jobDetails: ", jobDetails);
    if (!jobDetails) {
        notFound();
    }

    return (
        <div>
            <h1>Job ID: {jobId}</h1>
            {jobDetails && (
                <div>
                    <h2>{jobDetails.title}</h2>
                    <p>{jobDetails.description}</p>
                </div>
            )}
        </div>
    );
}