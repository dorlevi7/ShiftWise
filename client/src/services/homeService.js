import axios from 'axios';

// Base URL for home-related API requests
const API_URL = 'http://localhost:5000/api/home';

// Save the admin message for a specific company
export const saveAdminMessage = async (companyId, message) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/adminMessage`, { message });
        return response.data;
    } catch (error) {
        console.error('Error saving admin message:', error.message);
        throw error;
    }
};

// Retrieve the admin message for a specific company
export const getAdminMessage = async (companyId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/adminMessage`);
        return response.data;
    } catch (error) {
        console.error('Error fetching admin message:', error.message);
        throw error;
    }
};
