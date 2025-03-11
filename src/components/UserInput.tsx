'use client'

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';

interface UserInputProp {
    jobDescription: string;
    onJobDescriptionChange: (description: string) => void;
}

const exampleJobDescription = `Job Title: Senior Frontend Developer

About the Role:
We are looking for a Senior Frontend Developer to join our product team. You will be responsible for building user interfaces for our web applications, collaborating with designers, and mentoring junior developers.

Requirements:
- 4+ years of experience with React.js
- Strong understanding of JavaScript, HTML5, and CSS3
- Experience with modern frontend tooling (Webpack, Babel, etc.)
- Knowledge of responsive design and cross-browser compatibility
- Familiarity with state management libraries (Redux, MobX, etc.)
- Experience with TypeScript is a plus
- Good communication skills and ability to work in a team

Responsibilities:
- Develop new user-facing features using React.js
- Build reusable components and libraries for future use
- Optimize applications for maximum speed and scalability
- Collaborate with other team members and stakeholders`;

export const UserInput: React.FC<UserInputProp> = ({
                                                     jobDescription,
                                                     onJobDescriptionChange,
                                                   }) => {
    const { setIsLoading } = useLoading();
    const router = useRouter();
    const handlePasteExample = () => {
        onJobDescriptionChange(exampleJobDescription);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        if (e.currentTarget.elements && "jobDescription" in e.currentTarget.elements) {
            const jobDescriptionElement = e.currentTarget.elements.jobDescription as HTMLTextAreaElement;
            const jobDescriptionValue = jobDescriptionElement.value;

            // Send job description to the server
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({description: jobDescriptionValue}),
            });

            const {jobId} = await response.json();
            router.push(`/job/${jobId}`); // Redirect to the job page
        } else {
            console.error("jobDescription element not found in form.");
            setIsLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col w-full">
                <div className="relative">
                    <textarea
                        className="border border-gray-300 rounded-lg p-4 w-full min-h-[240px] resize-y focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        placeholder="Paste the job description here..."
                        value={jobDescription}
                        onChange={(e) => onJobDescriptionChange(e.target.value)}
                        name="jobDescription"
                    />
                    
                    {!jobDescription && (
                        <button
                            type="button"
                            onClick={handlePasteExample}
                            className="absolute top-2 right-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
                        >
                            Use Example
                        </button>
                    )}
                </div>
                
                <div className="mt-2 flex justify-between items-center text-xs text-gray-500">
                    <div>
                        {jobDescription.length > 0 ? (
                            <span>{jobDescription.length} characters</span>
                        ) : (
                            <span>Paste a job description or use our example</span>
                        )}
                    </div>
                    {jobDescription && (
                        <button
                            type="button"
                            onClick={() => onJobDescriptionChange('')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            Clear
                        </button>
                    )}
                </div>
                
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className={`
                            font-medium rounded-lg text-base px-8 py-3.5 text-center
                            transition-all duration-200 transform
                            ${jobDescription === ''
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                        }
                        `}
                        disabled={jobDescription === ''}
                    >
                        Generate Interview Questions
                    </button>
                </div>
            </div>
        </form>
    );
};