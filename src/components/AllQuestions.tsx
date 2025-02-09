import React from 'react';
import QuestionList from './QuestionList';

interface AllQuestionsProps {
    behavioralQuestions: { question: string; category: string; explanation: string; }[];
    technicalQuestions: { question: string; skill_area: string; explanation: string; }[];
}

export const AllQuestions: React.FC<AllQuestionsProps> = ({ behavioralQuestions, technicalQuestions }) => {
    return (
        <div className="relative">
            <QuestionList questions={behavioralQuestions} title="Behavioral Questions"/>
            <br/>
            <QuestionList questions={technicalQuestions} title="Technical Questions"/>
        </div>
    );
};