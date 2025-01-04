import { PacmanLoader } from 'react-spinners';

interface LoadingProps {
    status?: string;
}

export const Loading: React.FC<LoadingProps> = ({ status }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
        <PacmanLoader color="#36D7B7" size={50} />
    {status && <p className="mt-4 text-gray-600 font-bold">{status}</p>}
        </div>
    );
};