import React from 'react';

interface JobDescriptionDisplayProps {
    title: string;
    description: string;
}

export const JobDescriptionDisplay: React.FC<JobDescriptionDisplayProps> = ({
                                                                                title,
                                                                                description
                                                                            }) => {
    return (
        <div className="mt-8 w-full sm:w-96">
            <h2 className="text-lg font-semibold">Job Description:</h2>
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mb-4">{description}</p>
        </div>
    );
};
