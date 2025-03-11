'use client'

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase';

const SessionContext = createContext<{
    user_email: string | null;
    session: Session | null;
    setUser: (user_email: string | null) => void;
    setSession: (session: Session | null) => void;
}>({
    user_email: null,
    session: null,
    setUser: () => { },
    setSession: () => { }
});

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [user_email, setUser] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        // Initial session fetch (still useful for page load)
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user?.email ?? null);
        });

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("Auth State Change Event:", event);

                if (event === 'SIGNED_OUT') {
                    console.log("SIGNED_OUT event detected");
                    // Update session to null
                    setSession(session);
                    // Update user_email to null
                    setUser(session?.user?.email ?? null);
                } 
                // Handle SIGN_IN session events
                else if (event === 'SIGNED_IN') {
                    console.log("SIGNED_IN event detected");
                    setSession(session);
                    setUser(session?.user?.email ?? null);
                }
            }
        );

        return () => {
            subscription.unsubscribe(); // Cleanup the subscription on unmount
        };
    }, []);


    return (
        <SessionContext.Provider value={{ user_email, session, setUser, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);