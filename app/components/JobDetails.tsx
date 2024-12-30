import React from 'react';

interface JobDetailsProps {
    title: string;
    description: string;
}

export const JobDetails: React.FC<JobDetailsProps> = ({ title, description }) => {
    return (
        <div className="mb-8">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Job Title:</h3>
                <p className="text-gray-600">{title}</p>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-gray-700">Description:</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
            </div>
        </div>
    );
};