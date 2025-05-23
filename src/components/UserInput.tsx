'use client'

import React, {useEffect, useState} from 'react';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/context/LoadingContext';
import { formatDuration } from '@/utils/formatDuration';
import apiClient from "@/api";
import BasicError from "@/app/types/error";

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
    const { isLoading, setIsLoading } = useLoading();
    const [apiError, setApiError] = useState<string | null>(null);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [retryAfterSeconds, setRetryAfterSeconds] = useState(0); // In seconds
    const router = useRouter();

    const handlePasteExample = () => {
        onJobDescriptionChange(exampleJobDescription);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isRateLimited || isLoading) return;

        setIsLoading(true);
        setApiError(null);

        if (e.currentTarget.elements && "jobDescription" in e.currentTarget.elements) {
            const jobDescriptionElement = e.currentTarget.elements.jobDescription as HTMLTextAreaElement;
            const jobDescriptionValue = jobDescriptionElement.value;
            console.log("Submitting job description:", jobDescriptionValue);

            try {
                const response = await apiClient.post("/api/jobs", {description: jobDescriptionValue});
                const {jobId} = response.data;
                console.log("Received jobId:", jobId);
                router.push(`/job/${jobId}`); // Redirect to the job page
            } catch (error: BasicError) { // Catch any error
                console.error("API Error:", error);
                setIsLoading(false); // Ensure loading is stopped on error

                if (error.response && error.response.status === 429) {
                    setIsRateLimited(true);
                    const errorData = error.response.data;
                    const errorMessage = errorData?.description || errorData?.error || "You've made too many requests. Please try again later.";
                    setApiError(errorMessage);

                    // Check for Retry-After header (Flask-Limiter might send this)
                    // The header value can be seconds or an HTTP-date.
                    // apiClient should expose headers if possible.
                    const retryHeader = error.response.headers?.['retry-after'];
                    let waitSeconds = 60 * 60 * 24; // Default wait if no header

                    if (retryHeader) {
                        const parsedSeconds = parseInt(retryHeader, 10);
                        if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
                            waitSeconds = parsedSeconds;
                        } else {
                            // Try to parse as HTTP-date
                            const date = new Date(retryHeader);
                            if (!isNaN(date.getTime())) {
                                const now = new Date();
                                waitSeconds = Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 1000));
                            }
                        }
                    }
                    setRetryAfterSeconds(waitSeconds);

                    // A countdown timer displayed to the user
                    const timerId = setTimeout(() => {
                        setIsRateLimited(false);
                        setApiError(null);
                        setRetryAfterSeconds(0);
                    }, waitSeconds * 1000);
                    // Cleanup timeout if component unmounts
                    return () => clearTimeout(timerId);

                } else if (error.response && error.response.data) {
                    // Handle other API errors (e.g., validation errors from Flask)
                    const errorData = error.response.data;
                    setApiError(errorData?.error || `An error occurred: ${error.response.status}`);
                } else {
                    setApiError("An unexpected error occurred. Please try again.");
                }
            }

            } else {
            console.error("jobDescription element not found in form.");
            setApiError("Form error: Could not find job description input.");
            setIsLoading(false);
        }
    };

    useEffect(() => {
        let intervalId: NodeJS.Timeout | undefined;
        if (isRateLimited && retryAfterSeconds > 0) {
            intervalId = setInterval(() => {
                setRetryAfterSeconds((prev) => Math.max(0, prev - 1));
            }, 1000);
        } else if (retryAfterSeconds === 0 && isRateLimited) {
            // When countdown finishes, allow retrying (but don't clear message immediately, handleSubmit will)
            // setIsRateLimited(false); // Or let the main timeout handle this
        }
        return () => clearInterval(intervalId);
    }, [isRateLimited, retryAfterSeconds]);

    const isSubmitDisabled = jobDescription === '' || isLoading || isRateLimited;
    const formattedRetryDuration = formatDuration(retryAfterSeconds);

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
                        disabled={isLoading || isRateLimited}
                    />
                    
                    {!jobDescription && (
                        <button
                            type="button"
                            onClick={handlePasteExample}
                            className="absolute top-2 right-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition"
                            disabled={isLoading || isRateLimited}
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
                            disabled={isLoading || isRateLimited}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {apiError && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${isRateLimited ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {isRateLimited && retryAfterSeconds > 0 && (
                            <p className="text-xs">Daily limit reached. Please try again in {formattedRetryDuration}.</p>
                        )}
                    </div>
                )}

                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className={`
                            font-medium rounded-lg text-base px-8 py-3.5 text-center
                            transition-all duration-200 transform
                            ${isSubmitDisabled
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:to-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                        }
                        `}
                        disabled={isSubmitDisabled}
                    >
                        {isLoading ? 'Generating...' : (isRateLimited ? `Try again in ${formattedRetryDuration}` : 'Generate Interview Questions')}
                    </button>
                </div>
            </div>
        </form>
    );
};