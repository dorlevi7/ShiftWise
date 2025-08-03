// Loader component that displays a centered loading spinner using ThreeDots

// Import the ThreeDots spinner from react-loader-spinner
import { ThreeDots } from 'react-loader-spinner';

const Loader = () => {
    return (
        // Container to center the loader vertically and horizontally
        <div style={{
            height: '70vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            {/* Animated ThreeDots spinner */}
            <ThreeDots
                height="80"
                width="80"
                radius="9"
                color="#3498db"
                ariaLabel="loading"
                visible={true}
            />
        </div>
    );
};

export default Loader;
