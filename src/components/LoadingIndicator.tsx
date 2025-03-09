import { PacmanLoader } from "react-spinners";

const LoadingIndicator = ({ size }: { size: number }) => {
    return (
        <div className="flex justify-center items-center h-full">
            <PacmanLoader color="#3B82F6" size={size} />
        </div>
    );
};

export default LoadingIndicator;