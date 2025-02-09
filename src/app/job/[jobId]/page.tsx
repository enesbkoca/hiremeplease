import QuestionsPage from "@/components/QuestionsPage";


export default async function JobPage({ params }: { params: Promise<{ jobId: string }> }) {
    const { jobId } = await params;

    return (
        <main className="w-full flex justify-center">
            <QuestionsPage jobId={jobId}/>
        </main>
    );
}