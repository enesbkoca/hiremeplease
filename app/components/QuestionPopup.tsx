import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../useSpeechRecognition';

interface QuestionPopupProps {
    question: string;
    onClose: () => void;
    speechToken: string;
    region: string;
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose, speechToken, region }) => {
    const [timer, setTimer] = useState(0);
    const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
    const [showSplitButtons, setShowSplitButtons] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { isRecording, startRecording, stopRecording, transcription: liveTranscription } = useSpeechRecognition(speechToken, region);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [finalTranscription, setFinalTranscription] = useState('');

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        setFinalTranscription(liveTranscription);
    }, [liveTranscription]);

    const handleRecordButtonClick = () => {
        if (isRecording) {
            stopRecording();
            clearInterval(timerInterval!);
            setTimerInterval(null);
            setShowSplitButtons(true);
        } else {
            setTimer(0);
            setFinalTranscription('');
            setShowSplitButtons(false);
            const interval = setInterval(() => {
                setTimer((prevTimer) => prevTimer + 1);
            }, 1000);
            setTimerInterval(interval);

            startRecording((text) => {
                // The transcription is handled in the useSpeechRecognition hook now
            });
        }
    };

    const handleStartOver = () => {
        setTimer(0);
        setFinalTranscription('');
        handleRecordButtonClick();
    };

    const handleSendRecording = () => {
        console.log("Recording sent!", finalTranscription);
        setShowSplitButtons(false);
        setTimer(0);
        setFinalTranscription('');
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose}>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{question}</h3>
                <textarea
                    ref={textareaRef}
                    className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                    value={finalTranscription}
                    onChange={(e) => setFinalTranscription(e.target.value)}
                    rows={4}
                />
                <button
                    className={`w-full ${isProcessing ? 'bg-blue-700' : 'bg-blue-500'} text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2`}
                    onClick={handleProcessText}
                    disabled={isProcessing}
                >
                    Process Text
                </button>
                <div className="text-center text-gray-600 my-2">OR</div>
                {!showSplitButtons ? (
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2" onClick={handleRecordButtonClick}>
                        {isRecording ? "Stop Recording" : "Start Recording"}
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button className="w-1/2 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200" onClick={handleStartOver}>
                            Start Over
                        </button>
                        <button className="w-1/2 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-200" onClick={handleSendRecording}>
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
    );
};