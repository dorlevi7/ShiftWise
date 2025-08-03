import axios from 'axios';

// Base URL for notification-related API requests
const API_URL = 'http://localhost:5000/api/notifications';

// Fetch all notifications for a specific user in a company
export const getUserNotifications = async (companyId, userId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/${userId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
    }
};

// Send a notification to a specific user
export const sendNotification = async (companyId, userId, message, linkTo = '', meta = {}) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${userId}`, {
            message,
            linkTo,
            meta
        });
        return response.data;
    } catch (error) {
        console.error('Error sending notification:', error.message);
        throw error;
    }
};

// Mark a specific notification as read for a user
export const markAsRead = async (companyId, userId, notificationId) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/${userId}/${notificationId}/read`);
        return response.data;
    } catch (error) {
        console.error('Error marking notification as read:', error.message);
        throw error;
    }
};
