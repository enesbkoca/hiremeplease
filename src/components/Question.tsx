import React, { useState } from 'react';
import '@/styles/styles.css';

interface Question {
    question: string;
    category?: string;
    skill_area?: string;
    explanation: string;
}

interface QuestionProps {
    question: Question;
    onClick: (question: string) => void;
    disabled: boolean;
}

const Question: React.FC<QuestionProps> = ({ question, onClick, disabled }) => {
    const { question: text, category, skill_area, explanation } = question;
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`p-4 border rounded cursor-pointer transition duration-200 ${
                isHovered
                    ? 'bg-gray-100 border-gray-300 shadow-sm'
                    : 'border-gray-200'
            }`}
            onClick={disabled ? undefined : () => onClick(text)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <p className="font-semibold text-lg mb-2 text-gray-800">{text}</p>
            {category && (
                <p className="text-sm text-gray-600">
          <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            {category}
          </span>
                </p>
            )}
            {skill_area && (
                <p className="text-sm text-gray-600 mt-1">
          <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
            {skill_area}
          </span>
                </p>
            )}
            <p className="text-sm text-gray-700 mt-2">{explanation}</p>
        </div>
    );
};

export default Question;