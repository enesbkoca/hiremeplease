import { Suspense } from 'react';
import JobDisplay from "@/app/components/JobDisplay";

interface Params {
    jobId: string;
}

export default async function JobPage({ params }: { params: Params }) {
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    return (
        <Suspense fallback={<p>Loading Your Questions...</p>}>
            <div className="grid place-items-center h-full min-h-screen">
                <JobDisplay jobId={jobId}/>
            </div>
        </Suspense>
    );
}