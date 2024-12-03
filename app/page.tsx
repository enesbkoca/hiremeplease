'use client'

import { useState } from "react";

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);

  const generateQuestions = () => {
    // Here you would call your backend API to generate interview questions
    // For now, we'll simulate the question generation with dummy data.
    const questions = [
      "What interests you about this job?",
      "How do your skills align with this role?",
      "Can you describe a challenging project you've worked on?",
      "Why do you want to work with our company?",
    ];
    setInterviewQuestions(questions);
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