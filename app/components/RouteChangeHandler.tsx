'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLoading } from '@/app/context/LoadingContext';
import { Loading } from "@/app/components/Loading";

export default function RouteChangeHandler({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isLoading, setIsLoading } = useLoading();

    useEffect(() => {
        const handleComplete = () => setIsLoading(false);
        const handleStart = () => setIsLoading(true);

        window.addEventListener('routeChangeStart', handleStart);
        window.addEventListener('routeChangeComplete', handleComplete);
        window.addEventListener('routeChangeError', handleComplete);

        return () => {
            window.removeEventListener('routeChangeStart', handleStart);
            window.removeEventListener('routeChangeComplete', handleComplete);
            window.removeEventListener('routeChangeError', handleComplete);
        };
    }, [pathname, setIsLoading]);

    return (
        <div className="h-full">
            {children}
            {isLoading && <Loading/>}

        </div>
    );
}