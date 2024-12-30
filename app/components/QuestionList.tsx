import React from 'react';

interface Question {
    question: string;
    category?: string;
    skill_area?: string;
    explanation: string;
}

interface QuestionListProps {
    questions: Question[];
    onQuestionClick: (question: string) => void;
    title: string;
}

const QuestionList: React.FC<QuestionListProps> = ({ questions, onQuestionClick, title }) => {
    return (
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed mb-8">
                {questions.map((question, index) => (
                    <li
                        key={index}
                        className="mb-4 cursor-pointer"
                        onClick={() => onQuestionClick(question.question)}
                    >
                        <p className="font-semibold">{question.question}</p>
                        {question.category && <p className="text-sm text-gray-500">Category: {question.category}</p>}
                        {question.skill_area && <p className="text-sm text-gray-500">Skill Area: {question.skill_area}</p>}
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionList;