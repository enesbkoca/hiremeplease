'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

const SessionContext = createContext<{
    session: Session | null;
    setSession: (session: Session | null) => void;
    getUserEmail: () => string | null;
}>({
    session: null,
    setSession: () => { },
    getUserEmail: () => null,
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const getUserEmail = () => {
        if (session) {
            return session.user?.email || null;
        }
        return null;
    };

    useEffect(() => {
        // Initial session fetch (still useful for page load)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth State Change Event:", event);

                if (event === 'SIGNED_OUT') {
                    console.log("SIGNED_OUT event detected");
                    // Update session to null
                    setSession(session);
                } 
                // Handle SIGN_IN session events
                else if (event === 'SIGNED_IN') {
                    console.log("SIGNED_IN event detected");
                    setSession(session);
                }
            }
        );

        return () => {
            subscription.unsubscribe(); // Cleanup the subscription on unmount
        };
    }, []);


    return (
        <SessionContext.Provider value={{ session, setSession, getUserEmail }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);