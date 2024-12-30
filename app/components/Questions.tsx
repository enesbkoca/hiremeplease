import React, { useState } from 'react';
import QuestionList from './QuestionList';
import { QuestionPopup } from './QuestionPopup';

interface QuestionsProps {
    behavioralQuestions: { question: string; category: string; explanation: string; }[];
    technicalQuestions: { question: string; skill_area: string; explanation: string; }[];
    speechToken: string;
    region: string;
}

export const Questions: React.FC<QuestionsProps> = ({ behavioralQuestions, technicalQuestions, speechToken, region }) => {
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);

    const handleQuestionClick = (question: string) => {
        setSelectedQuestion(question);
    };

    const handleBackgroundClick = () => {
        setSelectedQuestion(null);
    };

    return (
        <div className="relative">
            <QuestionList questions={behavioralQuestions} onQuestionClick={handleQuestionClick} title="Behavioral Questions" />
            <QuestionList questions={technicalQuestions} onQuestionClick={handleQuestionClick} title="Technical Questions" />

            {selectedQuestion && (<QuestionPopup
                    question={selectedQuestion}
                    onClose={handleBackgroundClick}
                    speechToken={speechToken}
                    region={region}
                />
            )}
        </div>
    );
};