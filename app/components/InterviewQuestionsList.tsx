import React, {useState, useRef} from 'react';
import { ResultReason, SpeechRecognitionResult } from 'microsoft-cognitiveservices-speech-sdk';

import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

interface InterviewQuestionsListProps {
    behavioralQuestions: { question: string; category: string; explanation: string; }[];
    technicalQuestions: { question: string; skill_area: string; explanation: string; }[];
    speechToken: string;
}

export const InterviewQuestionsList: React.FC<InterviewQuestionsListProps> = ({ behavioralQuestions, technicalQuestions, speechToken }) => {
    const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
    const [isRecording, setIsRecording] = useState<boolean>(false); // Track recording state
    const [timer, setTimer] = useState<number>(0); // Track timer value
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null); // Store the timer interval
    const [showSplitButtons, setShowSplitButtons] = useState<boolean>(false); // Track whether to show split buttons
    const [isProcessing, setIsProcessing] = useState<boolean>(false); // Track processing state
    const [transcription, setTranscription] = useState<string>(''); // Store the transcribed text
    const textareaRef = useRef<HTMLTextAreaElement>(null);


    const handleQuestionClick = (question: string) => {
        setSelectedQuestion(question);
        setTranscription('');
    };

    const handleBackgroundClick = () => {
        setSelectedQuestion(null);
        stopRecording(); // Stop recording and reset timer when pop-up is closed
    };

    const handlePopupClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent clicks inside the pop-up from closing it
    };

    const startRecording = async () => {
        setIsRecording(true);
        setShowSplitButtons(false); // Ensure split buttons are hidden when starting over

        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
            speechToken,
            process.env.NEXT_PUBLIC_SPEECH_REGION as string
        )
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync(async (result: SpeechRecognitionResult) => {
            setIsRecording(false);
            if (timerInterval) {
                clearInterval(timerInterval);
                setTimerInterval(null);
            }
            setShowSplitButtons(true);

            if (result.reason === ResultReason.RecognizedSpeech) {
                setTranscription(result.text); // Update transcription state
                console.log('Transcribed Text:', result.text);
            } else {
                console.log('ERROR: Speech was cancelled or could not be recognized.');
            }
        });

        // Start the timer
        setTimer(0);
        const interval = setInterval(() => {
            setTimer((prevTimer) => prevTimer + 1);
        }, 1000);
        setTimerInterval(interval);
    };

    const stopRecording = () => {
        setIsRecording(false);
        // Stop the timer
        if (timerInterval) {
            clearInterval(timerInterval);
            setTimerInterval(null);
        }
        setShowSplitButtons(true); // Show split buttons when recording is stopped
    };

    const handleStartOver = () => {
        setTimer(0); // Reset the timer
        setTranscription(''); // Clear transcription on start over
        startRecording(); // Start recording again
    };

    const handleSendRecording = () => {
        // Implement logic to send the recording
        console.log("Recording sent!");
        setShowSplitButtons(false); // Hide split buttons after sending
        setTimer(0); // Reset the timer
        setTranscription('');
    };

    const handleRecordButtonClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleProcessText = () => {
        setIsProcessing(true); // Change button color to darker shade
        setTimeout(() => {
            setIsProcessing(false); // Revert button color after 3 seconds
        }, 3000);
        // Implement your text processing logic here
    };

    return (
        <div className="relative">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Behavioral Questions:</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed mb-8">
                {behavioralQuestions.map((question, index) => (
                    <li
                        key={index}
                        className="mb-4 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionClick(question.question);
                        }}
                    >
                        <p className="font-semibold">{question.question}</p>
                        <p className="text-sm text-gray-500">Category: {question.category}</p>
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </li>
                ))}
            </ul>

            <h2 className="text-lg font-semibold text-gray-700 mb-4">Technical Questions:</h2>
            <ul className="list-disc pl-6 text-gray-600 leading-relaxed">
                {technicalQuestions.map((question, index) => (
                    <li
                        key={index}
                        className="mb-4 cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleQuestionClick(question.question);
                        }}
                    >
                        <p className="font-semibold">{question.question}</p>
                        <p className="text-sm text-gray-500">Skill Area: {question.skill_area}</p>
                        <p className="text-sm text-gray-500">Explanation: {question.explanation}</p>
                    </li>
                ))}
            </ul>

            {selectedQuestion && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={handleBackgroundClick}>
                    <div
                        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md"
                        onClick={handlePopupClick}
                    >
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">{selectedQuestion}</h3>
                        <textarea
                            ref={textareaRef} // Attach ref to the textarea
                            className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                            value={transcription}
                            onChange={(e) => setTranscription(e.target.value)}
                            rows={4}
                        />
                        <button
                            className={`w-full ${
                                isProcessing ? 'bg-blue-700' : 'bg-blue-500'
                            } text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2`}
                            onClick={handleProcessText}
                            disabled={isProcessing}
                        >
                            Process Text
                        </button>
                        <div className="text-center text-gray-600 my-2">OR</div>
                        {!showSplitButtons ? (
                            <button
                                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2"
                                onClick={handleRecordButtonClick}
                            >
                                {isRecording ? "Stop Recording" : "Start Recording"}
                            </button>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200"
                                    onClick={handleStartOver}
                                >
                                    Start Over
                                </button>
                                <button
                                    className="w-1/2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200"
                                    onClick={handleSendRecording}
                                >
                                    Send Recording
                                </button>
                            </div>
                        )}
                        {(isRecording || showSplitButtons) && (
                            <div className="text-center text-gray-600">
                                <p>Recording Time: {timer} seconds</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};