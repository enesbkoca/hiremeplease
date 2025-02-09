import { PacmanLoader } from "react-spinners";

const LoadingIndicator = ({ size }: { size: number }) => {
    return (
        <div className="flex justify-center items-center h-full">
            <PacmanLoader color="#36D7B7" size={size} />
        </div>
    );
};

export default LoadingIndicator;