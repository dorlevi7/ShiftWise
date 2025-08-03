import axios from 'axios';

// Base URL for stats-related API requests
const API_URL = 'http://localhost:5000/api/stats';

// Save weekly statistics for a user
export const saveWeeklyStats = async (companyId, year, month, weekKey, userId, statsData) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${year}/${month}/${weekKey}/${userId}`, statsData);
        return response.data;
    } catch (error) {
        console.error('Error saving weekly stats:', error.message);
        throw error;
    }
};

// Get weekly statistics for a user
export const getWeeklyStats = async (companyId, year, month, weekKey, userId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${year}/${month}/${weekKey}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weekly stats:', error.message);
        throw error;
    }
};

// Update weekly statistics for a user
export const updateWeeklyStats = async (companyId, year, month, weekKey, userId, updatedStats) => {
    try {
        const response = await axios.put(`${API_URL}/${companyId}/${year}/${month}/${weekKey}/${userId}`, updatedStats);
        return response.data;
    } catch (error) {
        console.error('Error updating weekly stats:', error.message);
        throw error;
    }
};

// Delete weekly statistics for a user
export const deleteWeeklyStats = async (companyId, year, month, weekKey, userId) => {
    try {
        const response = await axios.delete(`${API_URL}/${companyId}/${year}/${month}/${weekKey}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting weekly stats:', error.message);
        throw error;
    }
};

// Get monthly statistics for a user
export const getMonthlyStats = async (companyId, year, month, userId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${year}/${month}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly stats:', error.message);
        throw error;
    }
};

// Get yearly statistics for a user
export const getYearlyStats = async (companyId, year, userId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${year}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching yearly stats:', error.message);
        throw error;
    }
};
