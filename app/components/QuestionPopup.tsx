import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../useSpeechRecognition';

interface QuestionPopupProps {
    question: string;
    onClose: () => void;
    speechToken: string;
    region: string;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose, speechToken, region }) => {
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isRecording, startRecording, stopRecording, transcription, setTranscription, error } = useSpeechRecognition(speechToken, region);

    const totalCountdownTime = 120; // 2 minutes countdown time

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (isRecording) {
            setCountdown(totalCountdownTime);
            const interval = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        clearInterval(interval);
                        setCountdownInterval(null);
                        stopRecording();
                        return 0;
                    }
                    return prevCountdown - 1;
                });
            }, 1000);
            setCountdownInterval(interval);
        } else if (countdownInterval) {
            clearInterval(countdownInterval);
            setCountdownInterval(null);
        }
        return () => {
            if (countdownInterval) {
                clearInterval(countdownInterval);
            }
        };
    }, [isRecording, stopRecording]);

    const handleRecordButtonClick = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleStartOver = () => {
        startRecording();
    };

    const handleSendRecording = () => {
        console.log("Recording sent!", transcription);
    };

    const handleProcessText = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
        }, 3000);
        if (textareaRef.current) {
            console.log("Processing text:", textareaRef.current.value);
        }
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose}>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{question}</h3>
                <textarea
                    ref={textareaRef}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                    rows={4}
                />
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <button
                    className={`w-full ${isProcessing ? 'bg-blue-700' : 'bg-blue-500'} text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2`}
                    onClick={handleProcessText}
                    disabled={isProcessing}
                >
                    Process Text
                </button>
                <div className="text-center text-gray-600 my-2">OR</div>
                {!isRecording ? (
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2" onClick={handleRecordButtonClick}>
                        Start Recording
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="w-1/3 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200" onClick={handleStartOver}>
                            Start Over
                        </button>
                        <button className="w-1/3 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200" onClick={handleSendRecording} disabled={!transcription.trim()}>
                            Send Recording
                        </button>
                        <button className="w-1/3 bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200" onClick={stopRecording}>
                            Stop Recording
                        </button>
                    </div>
                )}
                {isRecording && (
                    <div className="text-center text-gray-600">
                        <p>Time remaining: {formatTime(countdown)}</p>
                    </div>
                )}
            </div>
        </div>
    );
};