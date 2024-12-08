import React from 'react';

interface JobDescriptionDisplayProps {
    submittedJobDescription: string;
}

export const JobDescriptionDisplay: React.FC<JobDescriptionDisplayProps> = ({
                                                                                submittedJobDescription
                                                                            }) => {
    if (!submittedJobDescription) return null;

    return (
        <div className="mt-8 w-full sm:w-96">
            <h2 className="text-lg font-semibold">Job Description:</h2>
            <p className="mb-4">{submittedJobDescription}</p>
        </div>
    );
};
