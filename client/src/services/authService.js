// Import axios for making HTTP requests
import axios from 'axios';

// API endpoint for login
const API_URL = 'http://localhost:5000/api/auth/login';

// Sends login credentials to the server and returns the response
export const login = async (credentials) => {
    try {
        const response = await axios.post(API_URL, credentials);
        return response.data;
    } catch (error) {
        // Return error message if request fails
        return { success: false, message: error.response?.data?.message || 'Server error' };
    }
};
