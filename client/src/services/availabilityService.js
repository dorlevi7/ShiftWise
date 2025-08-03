import axios from 'axios';

// Base URL for availability-related API calls
const API_URL = 'http://localhost:5000/api/availability';

// Save availability data for a specific user and week
export const saveAvailability = async (companyId, weekKey, userId, availability) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/${userId}`, availability);
        return response.data;
    } catch (error) {
        console.error('Error saving availability:', error.message);
        throw error;
    }
};

// Get availability data for a specific user and week
export const getAvailability = async (companyId, weekKey, userId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching availability:', error.message);
        throw error;
    }
};

// Save weekly notes for a specific user
export const saveWeeklyNotes = async (companyId, weekKey, userId, notes) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/${userId}/notes`, { notes });
        return response.data;
    } catch (error) {
        console.error('Error saving weekly notes:', error.message);
        throw error;
    }
};

// Get all users' availability for a specific week
export const getAllAvailabilities = async (companyId, weekKey) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching all availabilities:', error.message);
        throw error;
    }
};

// Update the status of a single shift for a user
export const updateAvailabilityStatus = async (companyId, weekKey, userId, shift, day, status) => {
    try {
        const response = await axios.patch(`${API_URL}/${companyId}/${weekKey}/${userId}/status`, {
            shift,
            day,
            status
        });
        return response.data;
    } catch (error) {
        console.error('Error updating availability status:', error.message);
        throw error;
    }
};

// Save the number of necessary employees per shift
export const saveNecessaryEmployees = async (companyId, weekKey, necessaryEmployees) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/necessaryEmployees`,
            necessaryEmployees
        );
        return response.data;
    } catch (error) {
        console.error('Error saving necessary employees:', error.message);
        throw error;
    }
};

// Get the number of necessary employees per shift
export const getNecessaryEmployees = async (companyId, weekKey) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}/necessaryEmployees`);
        return response.data;
    } catch (error) {
        console.error('Error fetching necessary employees:', error.message);
        throw error;
    }
};

// Save weekly shift targets for employees
export const saveWeeklyShiftTargets = async (companyId, weekKey, weeklyShiftTargets) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/weeklyShiftTargets`, weeklyShiftTargets);
        return response.data;
    } catch (error) {
        console.error('Error saving weekly shift targets:', error.message);
        throw error;
    }
};

// Get weekly shift targets for employees
export const getWeeklyShiftTargets = async (companyId, weekKey) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}/weeklyShiftTargets`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weekly shift targets:', error.message);
        throw error;
    }
};

// Save publish status of a weekly schedule
export const savePublishStatus = async (companyId, weekKey, status) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/publishStatus`, { status });
        return response.data;
    } catch (error) {
        console.error('Error saving publish status:', error.message);
        throw error;
    }
};

// Get publish status of a weekly schedule
export const fetchPublishStatus = async (companyId, weekKey) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}/publishStatus`);
        return response.data;
    } catch (error) {
        console.error('Error fetching publish status:', error.message);
        throw error;
    }
};

// Save whether editing is allowed for the week
export const saveEditStatus = async (companyId, weekKey, isEditAllowed) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${weekKey}/editStatus`, { isEditAllowed });
        return response.data;
    } catch (error) {
        console.error('Error saving edit status:', error.message);
        throw error;
    }
};

// Get the current edit status of the week
export const fetchEditStatus = async (companyId, weekKey) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${weekKey}/editStatus`);
        return response.data;
    } catch (error) {
        console.error('Error fetching edit status:', error.message);
        throw error;
    }
};

// Save a vacation request for a user
export const saveVacationRequest = async (companyId, userId, requestId, vacationData) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/vacationRequests/${userId}/${requestId}`, vacationData);
        return response.data;
    } catch (error) {
        console.error('Error saving vacation request:', error.message);
        throw error;
    }
};

// Update the status of a vacation request
export const updateVacationStatus = async (companyId, userId, requestId, status) => {
    try {
        const response = await axios.patch(
            `http://localhost:5000/api/availability/${companyId}/vacationRequests/${userId}/${requestId}/status`,
            { status }
        );
        return response.data;
    } catch (error) {
        console.error('Error updating vacation status:', error.message);
        throw error;
    }
};

// Get a specific vacation request
export const getVacationRequest = async (companyId, userId, requestId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/vacationRequests/${userId}/${requestId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching vacation request:', error.message);
        throw error;
    }
};
