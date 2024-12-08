import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="w-full p-4 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} Hire Me Please. Powered by AI.</p>
        </footer>
    );
};

export default Footer;