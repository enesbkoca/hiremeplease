'use client';

import { useRouter } from 'next/navigation';

const GoBackButton: React.FC = () => {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="absolute top-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition duration-300 flex items-center font-semibold"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 mr-2"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
            Start over
        </button>
    );
};

export default GoBackButton;