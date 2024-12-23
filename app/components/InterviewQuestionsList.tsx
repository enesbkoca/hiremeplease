import React from 'react';

interface InterviewQuestionsListProps {
    behavioralQuestions: { question: string; category: string; explanation: string; }[];
    technicalQuestions: { question: string; skill_area: string; explanation: string; }[];
}

export const InterviewQuestionsList: React.FC<InterviewQuestionsListProps> = ({ behavioralQuestions, technicalQuestions }) => {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Behavioral Questions:</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed mb-8">
                {behavioralQuestions.map((question, index) => (
                    <li key={index} className="mb-4">
                        <p className="font-semibold">{question.question}</p>
                        <p className="text-sm text-gray-500">Category: {question.category}</p>
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </li>
                ))}
            </ul>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">Technical Questions:</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                {technicalQuestions.map((question, index) => (
                    <li key={index} className="mb-4">
                        <p className="font-semibold">{question.question}</p>
                        <p className="text-sm text-gray-500">Skill Area: {question.skill_area}</p>
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};