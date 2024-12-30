import JobDisplay from "@/app/components/JobDisplay";


export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;

    return (
        <div className="relative flex justify-center items-center">
            <JobDisplay jobId={jobId}/>
        </div>
    );
}