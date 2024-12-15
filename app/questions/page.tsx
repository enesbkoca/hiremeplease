'use client'

import axios from 'axios';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

import { JobDescriptionDisplay } from '../components/JobDescriptionDisplay';
import { InterviewQuestionsList } from '../components/InterviewQuestionsList';

export default function Questions() {
    const [jobDescription, setJobDescription] = useState<string | null>(null);
    const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);


    const generateQuestions = async () => {
        try {
          const response = await axios.post('/api/generate-questions', {
            jobDescription: jobDescription
          });
    
          const data = response.data;
          setInterviewQuestions(data.questions);
    
        } catch (error) {
          console.error('Error generating questions:', error);
        }
      };

    useEffect(() => {
        const fetchQuestions = async () => {
            if (jobDescription) {
                await generateQuestions();
            }
        };

        fetchQuestions();
        }, [jobDescription, interviewQuestions]);
    
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <JobDescriptionLoader setJobDescription={setJobDescription} />
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[70vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <InterviewQuestionsList
            questions={interviewQuestions}
          />
        </main>
      </div>
    </Suspense>
  );
}
      
function JobDescriptionLoader({ setJobDescription }: { setJobDescription: (desc: string | null) => void }) {
  const searchParams = useSearchParams();
  useEffect(() => {
    const description = searchParams.get("description");
    setJobDescription(description);
  }, [searchParams]);

  return null;
}