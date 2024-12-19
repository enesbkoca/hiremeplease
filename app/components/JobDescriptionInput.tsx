import React from 'react';

interface JobDescriptionInputProps {
    jobDescription: string;
    onJobDescriptionChange: (description: string) => void;
   handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
                                                                            jobDescription,
                                                                            onJobDescriptionChange,
                                                                            handleSubmit
                                                                        }) => {
    return (
        <form onSubmit={handleSubmit}>
      <textarea
          className="border-2 border-gray-300 rounded-lg p-4 w-full isRequired isClearable"
          placeholder="Paste the job description here..."
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          name="jobDescription"
      />
            <button
                type="submit"
                className="mt-4 bg-blue-500 text-white rounded-full px-6 py-2 hover:bg-blue-600"
                disabled={jobDescription === ''}
            >
                Generate Interview Questions
            </button>
        </form>
    );
};