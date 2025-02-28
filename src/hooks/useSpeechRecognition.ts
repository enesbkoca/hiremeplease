import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ResultReason,
    SpeechConfig,
    AudioConfig,
    SpeechRecognizer,
    CancellationDetails,
    CancellationReason
} from 'microsoft-cognitiveservices-speech-sdk';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

interface SpeechRecognitionError {
    code: string;
    message: string;
}

export const useSpeechRecognition = (speechToken: string, region: string) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);
    const [error, setError] = useState<SpeechRecognitionError | null>(null);

    const cleanup = useCallback(() => {
        if (recognizerRef.current) {
            recognizerRef.current.close();
            recognizerRef.current = null;
        }
        setIsRecording(false);
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    const handleError = useCallback((error: SpeechRecognitionError) => {
        setError(error);
        cleanup();
    }, [cleanup]);

    const startRecording = useCallback(async () => {
        try {
            setIsRecording(true);
            setTranscription('');
            setError(null);

            if (!speechToken || !region) {
                throw new Error('Speech configuration is missing');
            }

            const speechConfig = SpeechConfig.fromAuthorizationToken(speechToken, region);
            speechConfig.speechRecognitionLanguage = 'en-US';
            
            // Check if microphone is available
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Release the stream

            const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
            const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
            recognizerRef.current = recognizer;

            recognizer.recognized = (_sender, event) => {
                if (event.result.reason === ResultReason.RecognizedSpeech) {
                    setTranscription(prev => prev + event.result.text + ' ');
                } else if (event.result.reason === ResultReason.NoMatch) {
                    handleError({
                        code: 'NO_SPEECH',
                        message: 'No speech could be recognized. Please try speaking more clearly.'
                    });
                }
            };

            recognizer.canceled = (_sender, event) => {
                handleError({
                    code: event.reason === CancellationReason.Error ? 'ERROR' : 'CANCELED',
                    message: event.errorDetails || 'Recognition canceled'
                });
            };

            recognizer.sessionStopped = () => {
                cleanup();
            };

            await recognizer.startContinuousRecognitionAsync();
        } catch (err) {
            handleError({
                code: 'INITIALIZATION_ERROR',
                message: err instanceof Error ? err.message : 'Failed to start speech recognition'
            });
        }
    }, [region, speechToken, handleError, cleanup]);

    const stopRecording = useCallback(async () => {
        try {
            if (recognizerRef.current) {
                await recognizerRef.current.stopContinuousRecognitionAsync();
                cleanup();
            }
        } catch (err) {
            handleError({
                code: 'STOP_ERROR',
                message: 'Failed to stop recording properly'
            });
        }
    }, [cleanup, handleError]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        transcription,
        setTranscription,
        error
    };
};