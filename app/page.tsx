'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { UserInput } from './components/UserInput';
import { useLoading } from '@/app/context/LoadingContext';

export default function Home() {
    const router = useRouter();
    const [jobDescription, setJobDescription] = useState("");
    const { setIsLoading } = useLoading();


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setIsLoading(true);

        if (e.currentTarget.elements && "jobDescription" in e.currentTarget.elements) {
            const jobDescriptionElement = e.currentTarget.elements.jobDescription as HTMLTextAreaElement;
            const jobDescriptionValue = jobDescriptionElement.value;

            // Send job description to the server
            const response = await fetch("/api/create-job", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({description: jobDescriptionValue}),
            });

            const {jobId} = await response.json();
            router.push(`/job/${jobId}`); // Redirect to the job page
        } else {
            console.error("jobDescription element not found in form.");
        }
    };

    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-[70vh] p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <h1 className="text-2xl font-bold">Let&apos;s ace your interview</h1>

          <p className="text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] mb-4">
            Enter the job description, and we will generate interview questions to help you prepare.
          </p>

          <UserInput
              jobDescription={jobDescription}
              onJobDescriptionChange={setJobDescription}
              handleSubmit={handleSubmit}
          />

        </main>
      </div>
  );
}