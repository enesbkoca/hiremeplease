import { useState, useEffect, useRef } from 'react';
import { ResultReason, SpeechConfig, AudioConfig, SpeechRecognizer } from 'microsoft-cognitiveservices-speech-sdk';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeechRecognition = (speechToken: string, region: string) => {
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const recognizerRef = useRef<speechsdk.SpeechRecognizer | null>(null);
    const onResultRef = useRef<(text: string) => void>();

    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                recognizerRef.current.close();
            }
        };
    }, []);

    const startRecording = (onResult: (text: string) => void) => {
        setIsRecording(true);
        setTranscription(''); // Clear previous transcription
        onResultRef.current = onResult;

        const speechConfig = SpeechConfig.fromAuthorizationToken(speechToken, region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new SpeechRecognizer(speechConfig, audioConfig);
        recognizerRef.current = recognizer;

        recognizer.recognized = (s, eventArgs) => {
            if (eventArgs.result.reason === ResultReason.RecognizedSpeech) {
                setTranscription(prevTranscription => prevTranscription + eventArgs.result.text + ' ');
                if (onResultRef.current) {
                    onResultRef.current(eventArgs.result.text);
                }
            } else if (eventArgs.result.reason === ResultReason.NoMatch) {
                console.log("No speech could be recognized.");
            }
        };

        recognizer.sessionStopped = (s, eventArgs) => {
            console.log("\n    Session stopped event.");
            setIsRecording(false);
            recognizer.stopContinuousRecognitionAsync();
        };

        recognizer.canceled = (s, eventArgs) => {
            let message = `CANCELED: Reason=${eventArgs.reason}`;
            if (eventArgs.errorDetails) {
                message += ` ErrorDetails=${eventArgs.errorDetails}`;
            }
            console.log(message);
            setIsRecording(false);
            recognizer.stopContinuousRecognitionAsync();
        };

        recognizer.startContinuousRecognitionAsync();
    };

    const stopRecording = async () => {
        if (recognizerRef.current) {
            await recognizerRef.current.stopContinuousRecognitionAsync();
            setIsRecording(false);
        }
    };

    return { isRecording, startRecording, stopRecording, transcription };
};