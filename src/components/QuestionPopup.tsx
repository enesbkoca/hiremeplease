import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechToken } from '@/context/SpeechTokenContext';

import axios from 'axios';
import { FaMicrophone, FaStop, FaKeyboard, FaRedo, FaPaperPlane } from 'react-icons/fa';
import LoadingIndicator from "@/components/LoadingIndicator";

interface QuestionPopupProps {
    question: string;
    onClose: () => void;
    onSubmit: () => void;
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

interface AnalysisResponse {
    'Summary of Strengths': string;
    'Areas for Improvement': string;
    'Specific Suggestions': string[];
    'Practice Exercises': string[];
    'Encouragement': string;
}

const TOTAL_COUNTDOWN_TIME = 120;
const BUTTON_BASE_CLASSES = "w-full py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2";
const BUTTON_STYLES = {
    primary: `bg-blue-500 text-white hover:bg-blue-600 ${BUTTON_BASE_CLASSES}`,
    primaryDisabled: `bg-blue-300 text-white cursor-default ${BUTTON_BASE_CLASSES}`,
    secondary: `bg-gray-300 text-gray-700 hover:bg-gray-400 ${BUTTON_BASE_CLASSES}`,
    danger: `bg-red-500 text-white hover:bg-red-600 ${BUTTON_BASE_CLASSES}`,
    warning: `bg-yellow-500 text-white hover:bg-yellow-600 ${BUTTON_BASE_CLASSES}`,
};

export const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose, onSubmit }) => {
    const [countdown, setCountdown] = useState(TOTAL_COUNTDOWN_TIME);
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Initial);
    const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.Voice);
    const [response, setResponse] = useState<AnalysisResponse | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const countdownInterval = useRef<NodeJS.Timeout | null>(null);

    const { speechToken } = useSpeechToken();
    const { 
        isRecording, 
        startRecording, 
        stopRecording, 
        transcription, 
        setTranscription, 
        error: speechError 
    } = useSpeechRecognition(
        speechToken as string,
        process.env.NEXT_PUBLIC_SPEECH_REGION as string
    );

    // Cleanup functions
    const cleanupCountdown = useCallback(() => {
        if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
        }
    }, []);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
            cleanupCountdown();
        };
    }, [cleanupCountdown]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [inputMethod]);

    // Handle recording state changes
    useEffect(() => {
        if (inputMethod === InputMethod.Voice) {
            if (isRecording && recordingState !== RecordingState.Recording) {
                setRecordingState(RecordingState.Recording);
                // Start countdown
                setCountdown(TOTAL_COUNTDOWN_TIME);
                countdownInterval.current = setInterval(() => {
                    setCountdown(prev => {
                        if (prev <= 1) {
                            stopRecording();
                            cleanupCountdown();
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else if (!isRecording && recordingState === RecordingState.Recording) {
                setRecordingState(RecordingState.Stopped);
                cleanupCountdown();
            }
        }
    }, [inputMethod, isRecording, recordingState, stopRecording, cleanupCountdown]);

    const handleSubmit = async () => {
        const answerText = transcription.trim();
        if (!answerText) {
            setApiError('Please enter or record your answer.');
            return;
        }

        try {
            setIsLoading(true);
            setApiError(null);
            const res = await axios.post('/api/analyze-answer', { answer_text: answerText });
            const parsedResponse: AnalysisResponse = JSON.parse(res.data.analysis);
            setResponse(parsedResponse);
            onSubmit();
        } catch (err) {
            setApiError('Failed to analyze answer. Please try again.');
            console.error('API call failed:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReRecord = useCallback(() => {
        setTranscription('');
        setRecordingState(RecordingState.Initial);
        setInputMethod(InputMethod.Voice);
        setApiError(null);
    }, [setTranscription]);

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={onClose}>
            <div 
                className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto" 
                onClick={e => e.stopPropagation()}
            >
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{question}</h3>

                {isLoading && <LoadingIndicator size={25}/>}

                {!isLoading && (
                    <div>
                        {(inputMethod === InputMethod.Text || recordingState === RecordingState.Stopped) && (
                            <textarea
                                ref={textareaRef}
                                className="w-full p-2 border border-gray-300 rounded-lg mb-4"
                                value={transcription}
                                onChange={(e) => setTranscription(e.target.value)}
                                rows={4}
                            />
                        )}

                        {(speechError || apiError) && (
                            <div className="text-red-500 mb-2">
                                {speechError?.message || apiError}
                            </div>
                        )}

                        {response && (
                            <div className="mb-4 space-y-4">
                                {Object.entries(response).map(([key, value]) => (
                                    <div key={key}>
                                        <h5 className="font-semibold text-gray-700">{key}:</h5>
                                        {Array.isArray(value) ? (
                                            <ul className="list-disc pl-6 text-gray-600">
                                                {value.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-gray-600">{value}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-2">
                            {inputMethod === InputMethod.Text && (
                                <>
                                    <button
                                        className={transcription.trim() ? BUTTON_STYLES.primary : BUTTON_STYLES.primaryDisabled}
                                        onClick={handleSubmit}
                                        disabled={!transcription.trim()}
                                    >
                                        <FaPaperPlane/> Submit
                                    </button>
                                    <button 
                                        className={BUTTON_STYLES.secondary} 
                                        onClick={() => {
                                            setInputMethod(InputMethod.Voice);
                                            setTranscription('');
                                        }}
                                    >
                                        <FaMicrophone/> Use Voice Input
                                    </button>
                                </>
                            )}

                            {inputMethod === InputMethod.Voice && (
                                <>
                                    {recordingState === RecordingState.Initial && (
                                        <>
                                            <button 
                                                className={BUTTON_STYLES.primary} 
                                                onClick={startRecording}
                                            >
                                                <FaMicrophone/> Record Audio
                                            </button>
                                            <button 
                                                className={BUTTON_STYLES.secondary} 
                                                onClick={() => setInputMethod(InputMethod.Text)}
                                            >
                                                <FaKeyboard/> Enter Text Manually
                                            </button>
                                        </>
                                    )}

                                    {recordingState === RecordingState.Recording && (
                                        <>
                                            <div className="text-center text-gray-600 mb-2">
                                                Time remaining: {formatTime(countdown)}
                                            </div>
                                            <button 
                                                className={BUTTON_STYLES.warning} 
                                                onClick={stopRecording}
                                            >
                                                <FaStop/> Stop Recording
                                            </button>
                                        </>
                                    )}

                                    {recordingState === RecordingState.Stopped && (
                                        <>
                                            <button 
                                                className={BUTTON_STYLES.primary} 
                                                onClick={handleSubmit}
                                            >
                                                <FaPaperPlane/> Submit
                                            </button>
                                            <button 
                                                className={BUTTON_STYLES.danger} 
                                                onClick={handleReRecord}
                                            >
                                                <FaRedo/> Re-record
                                            </button>
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};