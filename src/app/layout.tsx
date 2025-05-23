import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";

import { Analytics } from '@vercel/analytics/react';
import { SessionProvider} from '@/context/SessionContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { LoadingProvider } from '@/context/LoadingContext';

const geistSans = localFont({
    src: "./fonts/GeistVF.woff",
    variable: "--font-geist-sans",
    weight: "100 900",
});
const geistMono = localFont({
    src: "./fonts/GeistMonoVF.woff",
    variable: "--font-geist-mono",
    weight: "100 900",
});

export const metadata: Metadata = {
    title: "Hire Me Please",
    description: "App that will get you hired ;)",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <SessionProvider>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
                    <Header/>
                <main className="flex-grow">
                    <div className="relative flex-grow h-full flex justify-center items-start">
                        <div className="max-w-6xl w-full px-4 py-8 sm:py-10">
                            <LoadingProvider>
                                {children}
                            </LoadingProvider>
                        </div>
                    </div>
                </main>
                <Footer/>
                <div className="analyticsComponent">
                    <Analytics/>
                </div>
            </body>
        </SessionProvider>
        </html>
    );
}