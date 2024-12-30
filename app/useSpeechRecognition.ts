import { useState } from 'react';
import { ResultReason, SpeechRecognitionResult } from 'microsoft-cognitiveservices-speech-sdk';
import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

export const useSpeechRecognition = (speechToken: string, region: string) => {
    const [isRecording, setIsRecording] = useState(false);

    const startRecording = async (onResult: (text: string) => void) => {
        setIsRecording(true);

        const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(speechToken, region);
        speechConfig.speechRecognitionLanguage = 'en-US';

        const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
        const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

        recognizer.recognizeOnceAsync((result: SpeechRecognitionResult) => {
            setIsRecording(false);
            if (result.reason === ResultReason.RecognizedSpeech) {
                onResult(result.text); // Call the callback with the transcribed text
            } else {
                console.error('ERROR: Speech was cancelled or could not be recognized.', result.errorDetails);
                onResult(""); // Important: Call the callback even on error, perhaps with an empty string
            }
        });
    };

    const stopRecording = () => {
        setIsRecording(false);
    };

    return { isRecording, startRecording, stopRecording }; // transcription is removed
};