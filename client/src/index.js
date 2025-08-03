// Import React core library
import React from 'react';

// Import ReactDOM for rendering components to the DOM
import ReactDOM from 'react-dom/client';

// Import the main App component
import App from './App';

// Create the root element for the React application
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component inside <React.StrictMode> for highlighting potential problems
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
