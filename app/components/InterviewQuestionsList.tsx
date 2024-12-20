import React from 'react';

interface InterviewQuestionsListProps {
    questions: string;
}

export const InterviewQuestionsList: React.FC<InterviewQuestionsListProps> = ({ questions }) => {
    if (!questions) return null;

    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Interview Questions:</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                {questions.split('\n').map((question, index) => (
                    <li key={index} className="mb-2">{question}</li>
                ))}
            </ul>
        </div>
    );
};