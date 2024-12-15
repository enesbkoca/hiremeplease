import { useRouter } from 'next/router';
import { useEffect, useState } from 'react'; 

export default function Questions() {
    const router = useRouter();
    const {data} = router.query;

    const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
    const [submittedJobDescription, setSubmittedJobDescription] = useState("");

    useEffect(() => {
        if (data) {
            setInterviewQuestions(data.questions);
            setSubmittedJobDescription(data.jobDescription);
        } else {
            router.push({pathway: "/"})
        }
    })

    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[70vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

          <JobDescriptionDisplay
              submittedJobDescription={submittedJobDescription}
          />

          <InterviewQuestionsList
              questions={interviewQuestions}
          />
        </main>
      </div>
  );
}