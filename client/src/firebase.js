// Import Firebase core functions for client-side usage
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration for the client-side app
const firebaseConfig = {
    apiKey: "AIzaSyBrqvsCUHFwdatp1IJdu9Ik90sDLcQBTJo",
    authDomain: "shiftwise-88bad.firebaseapp.com",
    databaseURL: "https://shiftwise-88bad-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "shiftwise-88bad",
    storageBucket: "shiftwise-88bad.firebasestorage.app",
    messagingSenderId: "498271462574",
    appId: "1:498271462574:web:090b964a1166650005b93f",
    measurementId: "G-CFMV009P5X"
};

// Initialize the Firebase app with the provided config
const app = initializeApp(firebaseConfig);

// Initialize Google Analytics (only works in production and with consent)
const analytics = getAnalytics(app);

// Export the initialized Firebase app for use throughout the client app
export default app;
