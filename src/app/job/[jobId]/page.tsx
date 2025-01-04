import QuestionsPage from "@/components/QuestionsPage";


export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;

    return (
        <div className="flex justify-center items-center h-full w-full">
            <QuestionsPage jobId={jobId}/>
        </div>
    );
}