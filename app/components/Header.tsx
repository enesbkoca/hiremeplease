'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'

import GoBackButton from "@/app/components/GoBackButton";

const Header: React.FC = () => {
    const pathname = usePathname()
    const isJobDetailPage = pathname.startsWith('/job/');

    return (
        <header className="flex justify-between items-center w-full p-4">
            <Link href="/">
                <div className="flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                        <path d="m15 5 4 4"/>
                    </svg>
                    <span className="font-semibold">Hire Me Please</span>
                </div>
            </Link>
            {isJobDetailPage && <GoBackButton />} {/* conditionally render go back button */}
        </header>
    );
};

export default Header;