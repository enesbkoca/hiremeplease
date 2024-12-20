import React from 'react';

interface JobDescriptionDisplayProps {
    title: string;
    description: string;
}

export const JobDescriptionDisplay: React.FC<JobDescriptionDisplayProps> = ({ title, description }) => {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Job Title:</h3>
                <p className="text-gray-600">{title}</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-700">Job Description:</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};