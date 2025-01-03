import { Suspense } from 'react';
import JobDisplay from "@/app/components/JobDisplay";


export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;

    return (
        <div className="relative flex justify-center items-center h-full min-h-screen">
            <Suspense fallback={<div className="flex flex-col items-center justify-center h-screen"><p>Loading Your Questions...</p></div>}>
                <JobDisplay jobId={jobId} />
            </Suspense>
        </div>
    );
}