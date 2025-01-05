import React, { createContext, useContext, ReactNode  } from 'react';

interface SpeechTokenContextType {
    speechToken: string | null;
}

const SpeechTokenContext = createContext<SpeechTokenContextType>({
    speechToken: null,
});

export const useSpeechToken = () => useContext(SpeechTokenContext);

export const SpeechTokenProvider: React.FC<{ value: string | null, children: ReactNode }> = ({ value, children }) => {
    return (
        <SpeechTokenContext.Provider value={{ speechToken: value }}>
            {children}
        </SpeechTokenContext.Provider>
    );
};