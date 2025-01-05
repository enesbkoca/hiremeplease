import React from 'react';
import Question from '@/components/Question';
import '@/styles/styles.css';

interface QuestionListProps {
    questions: Question[];
    title: string;
}

const QuestionList: React.FC<QuestionListProps> = ({
                                                       questions,
                                                       title,
                                                   }) => {
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg shadow-md">
                {title}
            </h2>
            <div className="space-y-4">
                {questions.map((question, index) => (
                    <Question
                        key={index}
                        question={question}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuestionList;