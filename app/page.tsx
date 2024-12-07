'use client'

import { useState } from "react";
import axios from 'axios';

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

          <textarea
              className="border-2 border-gray-300 rounded-lg p-4 w-full"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
          />

          <button
              className="mt-4 bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600"
              onClick={generateQuestions}
          >
            Generate Interview Questions
          </button>

          {submittedJobDescription && (
              <div className="mt-8 w-full sm:w-96">
                <h2 className="text-lg font-semibold">Job Description:</h2>
                <p className="mb-4">{submittedJobDescription}</p>
              </div>
          )}

          {interviewQuestions.length > 0 && (
              <div className="mt-8 w-full sm:w-96">
                <h2 className="text-lg font-semibold">Interview Questions:</h2>
                <ul className="list-disc pl-5">
                  {interviewQuestions.map((question, index) => (
                      <li key={index} className="mb-2">{question}</li>
                  ))}
                </ul>
              </div>
          )}
        </main>
      </div>
  );
}