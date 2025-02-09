import { useState, useEffect, useRef, useCallback } from 'react';
import {
    ResultReason,
    SpeechConfig,
    AudioConfig,
    SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeechRecognition = (speechToken: string, region: string) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);
    const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.close();
            }
        };
    }, []);

    const startRecording = useCallback(() => {
        setIsRecording(true);
        setTranscription('');
        setTranscriptionError(null);

        const speechConfig = SpeechConfig.fromAuthorizationToken(speechToken, region);
        speechConfig.speechRecognitionLanguage = 'en-US';
        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        recognizerRef.current = recognizer;

        recognizer.recognized = (_sender, eventArgs) => {
            if (eventArgs.result.reason === ResultReason.RecognizedSpeech) {
                setTranscription(prev => prev + eventArgs.result.text + ' ');
            } else if (eventArgs.result.reason === ResultReason.NoMatch) {
                console.warn("No speech could be recognized.");
            }
        };

        recognizer.sessionStopped = (_sender, eventArgs) => {
            console.log("Continuous recognition session stopped.");
            console.log(`Session id of event: ${eventArgs.sessionId}`)
            setIsRecording(false);
        };

        recognizer.canceled = (_sender, eventArgs) => {
            setIsRecording(false);
            const errorMessage = `Speech Recognition Canceled: Reason=${eventArgs.reason}, ErrorDetails=${eventArgs.errorDetails || 'N/A'}`;
            console.error(errorMessage);
            setTranscriptionError(errorMessage);
        };

        try {
            recognizer.startContinuousRecognitionAsync();
        } catch (err) {
            setIsRecording(false);
            const errorMessage = `Error starting recognition: ${err}`;
            console.error(errorMessage);
            setTranscriptionError(errorMessage);
        }

    }, [region, speechToken]);

    const stopRecording = useCallback(async () => {
        if (recognizerRef.current) {
            await recognizerRef.current.stopContinuousRecognitionAsync();
        }
    }, []);

    return { isRecording, startRecording, stopRecording, transcription, setTranscription, error: transcriptionError };
};