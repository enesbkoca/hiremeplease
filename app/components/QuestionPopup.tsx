import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../useSpeechRecognition';

interface QuestionPopupProps {
    question: string;
    onClose: () => void;
    speechToken: string;
    region: string;
}

enum RecordingState {
    Initial,
    Recording,
    Stopped,
}

enum InputMethod {
    Voice,
    Text,
}

export const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose, speechToken, region }) => {
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const { isRecording, startRecording, stopRecording, transcription, setTranscription, error } = useSpeechRecognition(speechToken, region);
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Initial);
    const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.Voice);

    const totalCountdownTime = 120;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (inputMethod === InputMethod.Voice && recordingState === RecordingState.Recording) {
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
    }, [inputMethod, recordingState, stopRecording]);

    useEffect(() => {
        if (inputMethod === InputMethod.Voice && isRecording && recordingState !== RecordingState.Recording) {
            setRecordingState(RecordingState.Recording);
        } else if (inputMethod === InputMethod.Voice && !isRecording && recordingState === RecordingState.Recording) {
            setRecordingState(RecordingState.Stopped);
        }
    }, [inputMethod, isRecording, recordingState]);

    const handleRecordButtonClick = () => {
        startRecording();
    };

    const handleStopButtonClick = () => {
        stopRecording();
    };

    const handleReRecord = () => {
        setTranscription('');
        setRecordingState(RecordingState.Initial);
        setInputMethod(InputMethod.Voice);
    };

    const handleSubmit = () => {
        console.log("Submitting text:", transcription);
        // TODO: Submit logic comes here
    };

    const handleEnterTextManually = () => {
        setInputMethod(InputMethod.Text);
    };

    const handleUseVoiceInput = () => {
        setInputMethod(InputMethod.Voice);
        setTranscription('');
        setRecordingState(RecordingState.Initial);
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

                {inputMethod === InputMethod.Text && (
                    <textarea
                        ref={textareaRef}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        rows={4}
                    />
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Stopped && (
                    <textarea
                        ref={textareaRef}
                        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                        value={transcription}
                        onChange={(e) => setTranscription(e.target.value)}
                        rows={4}
                    />
                )}

                {error && <div className="text-red-500 mb-2">{error}</div>}

                {inputMethod === InputMethod.Text && transcription.trim().length > 0 && (
                    <button
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Stopped && transcription.trim().length > 0 && (
                    <button
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Initial && (
                    <button className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 mb-2" onClick={handleRecordButtonClick}>
                        Record Audio
                    </button>
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Recording && (
                    <div>
                        <div className="text-center text-gray-600 mb-2">
                            Time remaining: {formatTime(countdown)}
                        </div>
                        <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg hover:bg-yellow-600 transition duration-200" onClick={handleStopButtonClick}>
                            Stop Recording
                        </button>
                    </div>
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Stopped && (
                    <div className="flex gap-2">
                        <button className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition duration-200" onClick={handleReRecord}>
                            Re-record
                        </button>
                    </div>
                )}

                {inputMethod === InputMethod.Voice && recordingState === RecordingState.Initial && (
                    <button className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200" onClick={handleEnterTextManually}>
                        Enter Text Manually
                    </button>
                )}

                {inputMethod === InputMethod.Text && (
                    <button className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200" onClick={handleUseVoiceInput}>
                        Use Voice Input
                    </button>
                )}
            </div>
        </div>
    );
};