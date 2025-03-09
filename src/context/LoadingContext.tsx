'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import LoadingIndicator from "@/components/LoadingIndicator";

interface LoadingContextProps {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
}

const LoadingContext = createContext<LoadingContextProps>({
    isLoading: false,
    setIsLoading: () => {},
});

export const LoadingProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
            {children}
            {isLoading && (
                <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
                    <div className="flex flex-col items-center">
                        <LoadingIndicator size={50}/>
                        <p className="mt-4 text-blue-600 font-medium">Generating your interview questions...</p>
                    </div>
                </div>
            )}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);