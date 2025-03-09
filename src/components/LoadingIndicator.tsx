import { PacmanLoader } from "react-spinners";

const LoadingIndicator = ({ size }: { size: number }) => {
    return (
        <div className="flex justify-center items-center">
            <PacmanLoader color="#3B82F6" size={size} margin={10} />
        </div>
    );
};

export default LoadingIndicator;