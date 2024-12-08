import React from 'react';

interface InterviewQuestionsListProps {
    questions: string[];
}

export const InterviewQuestionsList: React.FC<InterviewQuestionsListProps> = ({
                                                                                  questions
                                                                              }) => {
    if (questions.length === 0) return null;

    return (
        <div className="mt-8 w-full sm:w-96">
            <h2 className="text-lg font-semibold">Interview Questions:</h2>
            <ul className="list-disc pl-5">
                {questions.map((question, index) => (
                    <li key={index} className="mb-2">{question}</li>
                ))}
            </ul>
        </div>
    );
};