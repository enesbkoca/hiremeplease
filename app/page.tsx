'use client'

import Link from 'next/link';
import { useState } from "react";
import { JobDescriptionInput } from './components/JobDescriptionInput';

export default function Home() {
  const [jobDescription, setJobDescription] = useState("");

  return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[70vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-2xl font-bold">Let&apos;s ace your interview</h1>
          <p className="text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] mb-4">
            Enter the job description, and we will generate interview questions to help you prepare.
          </p>

          <JobDescriptionInput
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
          />
          <Link
            href={{
              pathname: '/questions',
              query: {
                description: jobDescription
              }
            }}
          >
            Generate Questions
          </Link>
        </main>
      </div>
  );
}