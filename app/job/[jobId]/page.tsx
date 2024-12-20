import { Suspense } from 'react';
import JobDisplay from "@/app/components/JobDisplay";

interface Params {
    jobId: string;
}

export default async function JobPage({ params }: { params: Params }) {
    const resolvedParams = await params;
    const jobId = resolvedParams.jobId;

    return (
        <Suspense fallback={<p>Loading Job Page...</p>}>
            <JobDisplay jobId={jobId} />
        </Suspense>
    );
}