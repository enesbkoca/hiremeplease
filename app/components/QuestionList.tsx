import React, { useState } from 'react';
import '@/app/styles.css';

interface Question {
    question: string;
    category?: string;
    skill_area?: string;
    explanation: string;
}

interface QuestionListProps {
    questions: Question;
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
        <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <div
                        key={index}
                        className={`p-4 border rounded cursor-pointer transition duration-200 ${
                            hoveredIndex === index ? 'bg-gray-100 border-gray-300 shadow-sm' : 'border-gray-200'
                        }`}
                        onClick={() => onQuestionClick(question.question)}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <p className="font-semibold">{question.question}</p>
                        {question.category && <p className="text-sm text-gray-500">Category: {question.category}</p>}
                        {question.skill_area && <p className="text-sm text-gray-500">Skill Area: {question.skill_area}</p>}
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default QuestionList;