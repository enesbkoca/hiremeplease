import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/app/globals.css";

import { Analytics } from '@vercel/analytics/react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

import { LoadingProvider } from '@/context/LoadingContext';
import RouteChangeHandler from '@/components/RouteChangeHandler';

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
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}>
        <LoadingProvider>
            <Header />
            <main className="flex-grow">
                <RouteChangeHandler>
                    {children}
                </RouteChangeHandler>
            </main>
            <Footer />
            <div className="analyticsComponent">
                <Analytics />
            </div>
        </LoadingProvider>
        </body>
        </html>
    );
}