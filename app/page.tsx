'use client'

import axios from 'axios';

import { useState } from "react";
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { JobDescriptionDisplay } from './components/JobDescriptionDisplay';
import { InterviewQuestionsList } from './components/InterviewQuestionsList';

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [submittedJobDescription, setSubmittedJobDescription] = useState("");

  const generateQuestions = async () => {
    try {
      const response = await axios.post('/api/generate-questions', {
        jobDescription: jobDescription
      });

      const data = response.data;
      setInterviewQuestions(data.questions);
      setSubmittedJobDescription(data.jobDescription);
    } catch (error) {
      console.error('Error generating questions:', error);
    }
  };

  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-2xl font-bold">Prepare for Your Interview</h1>
          <p className="text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] mb-4">
            Enter a job description, and we will generate interview questions to help you prepare.
          </p>

          <JobDescriptionInput
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              onGenerateQuestions={generateQuestions}
          />

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