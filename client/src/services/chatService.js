import axios from 'axios';

// Base URL for chat-related API calls
const API_URL = 'http://localhost:5000/api/chat';

// Send a message to the group chat
export const sendGroupMessage = async (companyId, messageData) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/group`, messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending group message:', error.message);
        throw error;
    }
};

// Get all group messages for a company
export const getGroupMessages = async (companyId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/group`);
        return response.data;
    } catch (error) {
        console.error('Error fetching group messages:', error.message);
        throw error;
    }
};

// Send a private message between two users
export const sendPrivateMessage = async (companyId, user1Id, user2Id, messageData) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/private/${user1Id}/${user2Id}`, messageData);
        return response.data;
    } catch (error) {
        console.error('Error sending private message:', error.message);
        throw error;
    }
};

// Get all private messages between two users
export const getPrivateMessages = async (companyId, user1Id, user2Id) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/private/${user1Id}/${user2Id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching private messages:', error.message);
        throw error;
    }
};

// Mark private messages as seen by a user
export const markPrivateSeen = async (companyId, user1Id, user2Id, viewerId) => {
    try {
        const response = await axios.post(`${API_URL}/${companyId}/private/${user1Id}/${user2Id}/seen/${viewerId}`);
        return response.data;
    } catch (error) {
        console.error('Error marking private messages as seen:', error.message);
        throw error;
    }
};

// Get the timestamp of the last seen private message by a user
export const getPrivateLastSeen = async (companyId, user1Id, user2Id, viewerId) => {
    try {
        const response = await axios.get(`${API_URL}/${companyId}/private/${user1Id}/${user2Id}/last-seen/${viewerId}`);
        return response.data?.lastSeen || 0;
    } catch (error) {
        console.error('Error getting last seen:', error.message);
        return 0;
    }
};
