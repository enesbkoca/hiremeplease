import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useSpeechToken } from '@/context/SpeechTokenContext';
import { logger } from '@/utils/logger';

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

export const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose, onSubmit }) => {
    const [countdown, setCountdown] = useState(0);
    const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { speechToken } = useSpeechToken();
    const { isRecording, startRecording, stopRecording, transcription, setTranscription, error } = useSpeechRecognition(
        speechToken as string,
        process.env.NEXT_PUBLIC_SPEECH_REGION as string
    );
    const [recordingState, setRecordingState] = useState<RecordingState>(RecordingState.Initial);
    const [inputMethod, setInputMethod] = useState<InputMethod>(InputMethod.Voice);
    const [response, setResponse] = useState<AnalysisResponse | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const totalCountdownTime = 120;

    // Disable background scrolling when the popup is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    useEffect(() => {
        if (inputMethod === InputMethod.Voice && recordingState === RecordingState.Recording) {
            logger.info('Starting recording countdown');
            setCountdown(totalCountdownTime);
            const interval = setInterval(() => {
                setCountdown((prevCountdown) => {
                    if (prevCountdown <= 1) {
                        logger.info('Recording time limit reached');
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
            logger.info('Started recording');
            setRecordingState(RecordingState.Recording);
        } else if (inputMethod === InputMethod.Voice && !isRecording && recordingState === RecordingState.Recording) {
            logger.info('Stopped recording');
            setRecordingState(RecordingState.Stopped);
        }
    }, [inputMethod, isRecording, recordingState]);

    const handleRecordButtonClick = () => {
        logger.debug('Record button clicked');
        startRecording();
    };

    const handleStopButtonClick = () => {
        logger.debug('Stop button clicked');
        stopRecording();
    };

    const handleReRecord = () => {
        logger.debug('Re-recording initiated');
        setTranscription('');
        setRecordingState(RecordingState.Initial);
        setInputMethod(InputMethod.Voice);
    };

    const handleSubmit = async () => {
        const answerText = transcription.trim();
        if (answerText === '') {
            logger.warn('Attempted to submit empty answer');
            alert('Please enter or record your answer.');
            return;
        }

        try {
            logger.info('Submitting answer for analysis');
            setIsLoading(true);
            const res = await axios.post('/api/analyses', { answer_text: answerText });
            const analysis: AnalysisResponse = res.data.analysis;
            setResponse(analysis);
            setIsLoading(false);
            setApiError(null);
            logger.info('Answer analysis completed successfully');
            onSubmit();
        } catch (err) {
            logger.error('API call failed:', { error: err });
            setApiError('Failed to analyze answer. Please try again.');
            setIsLoading(false);
        }
    };

    const handleEnterTextManually = () => {
        logger.debug('Switching to manual text input');
        setInputMethod(InputMethod.Text);
    };

    const handleUseVoiceInput = () => {
        logger.debug('Switching to voice input');
        setInputMethod(InputMethod.Voice);
        setTranscription('');
        setRecordingState(RecordingState.Initial);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const buttonBaseClasses = "w-full py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2";
    const primaryButtonClasses = `bg-blue-500 text-white hover:bg-blue-600 ${buttonBaseClasses}`;
    const primaryButtonDisabledClasses = `bg-blue-300 text-white cursor-default ${buttonBaseClasses}`;
    const secondaryButtonClasses = `bg-gray-300 text-gray-700 hover:bg-gray-400 ${buttonBaseClasses}`;
    const dangerButtonClasses = `bg-red-500 text-white hover:bg-red-600 ${buttonBaseClasses}`;
    const warningButtonClasses = `bg-yellow-500 text-white hover:bg-yellow-600 ${buttonBaseClasses}`;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-10" onClick={(e) => {e.stopPropagation(); onClose();}}>
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-semibold text-gray-700 mb-4">{question}</h3>

                {(isLoading) && <LoadingIndicator size={25}/>}

                {(!isLoading) && <div>
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

                    {response && (
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700">Analysis:</h4>
                            <div className="space-y-4">
                                <div>
                                    <h5 className="font-semibold text-gray-700">Summary of Strengths:</h5>
                                    <p className="text-gray-600">{response['Summary of Strengths']}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-700">Areas for Improvement:</h5>
                                    <p className="text-gray-600">{response['Areas for Improvement']}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-700">Specific Suggestions:</h5>
                                    <ul className="list-disc pl-6 text-gray-600">
                                        {response['Specific Suggestions'].map((suggestion, index) => (
                                            <li key={index}>{suggestion}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-700">Practice Exercises:</h5>
                                    <ul className="list-disc pl-6 text-gray-600">
                                        {response['Practice Exercises'].map((exercise, index) => (
                                            <li key={index}>{exercise}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-700">Encouragement:</h5>
                                    <p className="text-gray-600">{response['Encouragement']}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {apiError && <p className="text-red-500 text-sm mt-2">{apiError}</p>}

                    {inputMethod === InputMethod.Text && (
                        <div className="mb-2">
                            <button
                                className={transcription.trim().length > 0 ? primaryButtonClasses : primaryButtonDisabledClasses}
                                onClick={handleSubmit}
                                disabled={transcription.trim().length === 0}
                            >
                                <FaPaperPlane/> Submit
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Voice && recordingState === RecordingState.Stopped && (
                        <div className="mb-2">
                            <button className={primaryButtonClasses} onClick={handleSubmit}>
                                <FaPaperPlane/> Submit
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Voice && recordingState === RecordingState.Initial && (
                        <div className="mb-2">
                            <button className={primaryButtonClasses} onClick={handleRecordButtonClick}>
                                <FaMicrophone/> Record Audio
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Voice && recordingState === RecordingState.Recording && (
                        <div className="mb-2">
                            <div className="text-center text-gray-600 mb-2">
                                Time remaining: {formatTime(countdown)}
                            </div>
                            <button className={warningButtonClasses} onClick={handleStopButtonClick}>
                                <FaStop/> Stop Recording
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Voice && recordingState === RecordingState.Stopped && (
                        <div className="flex gap-2 mb-2">
                            <button className={dangerButtonClasses} onClick={handleReRecord}>
                                <FaRedo/> Re-record
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Voice && recordingState === RecordingState.Initial && (
                        <div className="mb-2">
                            <button className={secondaryButtonClasses} onClick={handleEnterTextManually}>
                                <FaKeyboard/> Enter Text Manually
                            </button>
                        </div>
                    )}

                    {inputMethod === InputMethod.Text && (
                        <div className="mb-2">
                            <button className={secondaryButtonClasses} onClick={handleUseVoiceInput}>
                                <FaMicrophone/> Use Voice Input
                            </button>
                        </div>
                    )}
                </div>}
            </div>
        </div>
    );
};