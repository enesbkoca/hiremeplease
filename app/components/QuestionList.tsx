import React, { useState } from 'react';
import '@/app/styles.css';

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

const QuestionList: React.FC<QuestionListProps> = ({
                                                       questions,
                                                       onQuestionClick,
                                                       title,
                                                   }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-lg shadow-md">
                {title}
            </h2>
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={`p-4 border rounded cursor-pointer transition duration-200 ${
                            hoveredIndex === index
                                ? 'bg-gray-100 border-gray-300 shadow-sm'
                                : 'border-gray-200'
                        }`}
                        onClick={() => onQuestionClick(question.question)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <p className="font-semibold text-lg mb-2 text-gray-800">
                            {question.question}
                        </p>
                        {question.category && (
                            <p className="text-sm text-gray-600">
                                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
                                    {question.category}
                                </span>
                            </p>
                        )}
                        {question.skill_area && (
                            <p className="text-sm text-gray-600 mt-1">
                                <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                    {question.skill_area}
                                </span>
                            </p>
                        )}
                        <p className="text-sm text-gray-700 mt-2">
                            {question.explanation}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;