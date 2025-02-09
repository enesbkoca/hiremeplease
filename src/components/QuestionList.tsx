import React, { useState } from 'react';
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
    const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>(
        new Array(questions.length).fill(false)
    );

    const handleAnswerSubmit = (index: number) => {
        const updatedAnsweredQuestions = [...answeredQuestions];
        updatedAnsweredQuestions[index] = true;
        setAnsweredQuestions(updatedAnsweredQuestions);
    };

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
                        disabled={index > 0 && !answeredQuestions[index - 1]}
                        onAnswerSubmit={() => handleAnswerSubmit(index)}
                        isAnswered={answeredQuestions[index]}
                    />
                ))}
            </div>
        </div>
    );
};

export default QuestionList;