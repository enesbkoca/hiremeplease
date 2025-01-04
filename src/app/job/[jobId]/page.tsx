import QuestionsPage from "@/components/QuestionsPage";


export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;

    return (
        <div className="relative flex justify-center items-center">
            <QuestionsPage jobId={jobId}/>
        </div>
    );
}