import axios from 'axios';

// Base URL for shift-related API requests
const API_URL = 'http://localhost:5000/api/shifts';

// Fetch all shifts
export const getShifts = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching shifts:', error.message);
        throw error;
    }
};

// Fetch a single shift by its ID
export const getShiftById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching shift with ID ${id}:`, error.message);
        throw error;
    }
};

// Add a new shift
export const addShift = async (shiftData) => {
    try {
        const response = await axios.post(API_URL, shiftData);
        return response.data;
    } catch (error) {
        console.error('Error adding shift:', error.message);
        throw error;
    }
};

// Update an existing shift by ID
export const updateShift = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating shift with ID ${id}:`, error.message);
        throw error;
    }
};

// Delete a shift by ID
export const deleteShift = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting shift with ID ${id}:`, error.message);
        throw error;
    }
};
