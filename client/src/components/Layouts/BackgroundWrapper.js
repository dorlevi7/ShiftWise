// BackgroundWrapper component adds a full-page background image behind its children

const BackgroundWrapper = ({ children }) => {
    return (
        // Wrapper div with background image styles
        <div
            className="background-wrapper"
            style={{
                backgroundImage: 'url("/images/ShiftWise_BackgroundImg.png")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                minHeight: '100vh',
            }}
        >
            {/* Render child components on top of the background */}
            {children}
        </div>
    );
};

export default BackgroundWrapper;
