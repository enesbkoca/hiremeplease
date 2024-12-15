import React from 'react';

interface JobDescriptionInputProps {
    jobDescription: string;
    onJobDescriptionChange: (description: string) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
                                                                            jobDescription,
                                                                            onJobDescriptionChange,
                                                                        }) => {
    return (
        <>
      <textarea
          className="border-2 border-gray-300 rounded-lg p-4 w-full"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
      />

            {/* <button
                className="mt-4 bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600"
                onClick={onGenerateQuestions}
            >
                Generate Interview Questions
            </button> */}
        </>
    );
};