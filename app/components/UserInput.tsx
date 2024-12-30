import React from 'react';

interface UserInputProp {
    jobDescription: string;
    onJobDescriptionChange: (description: string) => void;
   handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const UserInput: React.FC<UserInputProp> = ({
                                                                            jobDescription,
                                                                            onJobDescriptionChange,
                                                                            handleSubmit
                                                                        }) => {
    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col w-full">
                <textarea
                    className="border-2 border-gray-300 rounded-lg p-4 w-full isRequired isClearable flex-grow resize-y"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={(e) => onJobDescriptionChange(e.target.value)}
                    name="jobDescription"
                />
                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        className={`
                            font-medium rounded-lg text-base px-6 py-3 text-center mr-2 mb-2 
                            ${jobDescription === ''
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800 text-white'
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