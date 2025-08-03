import axios from 'axios';

// Base URL for user-related API requests
const API_URL = 'http://localhost:5000/api/users';

// Fetch all users
export const getUsers = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching users:', error.message);
        throw error;
    }
};

// Fetch a single user by ID
export const getUserById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching user with ID ${id}:`, error.message);
        throw error;
    }
};

// Add a new user
export const addUser = async (userData) => {
    try {
        const response = await axios.post(API_URL, userData);
        return response.data;
    } catch (error) {
        console.error('Error adding user:', error.message);
        throw error;
    }
};

// Update user data by ID
export const updateUser = async (id, updatedData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, updatedData);
        return response.data;
    } catch (error) {
        console.error(`Error updating user with ID ${id}:`, error.message);
        throw error;
    }
};

// Add a new company to the user's company list
export const updateUserCompanies = async (user, company) => {
    try {

        const updatedCompanyIds = user.companyIds
            ? [...user.companyIds, { companyId: company.id, companyName: company.name }]
            : [{ companyId: company.id, companyName: company.name }];

        const updatedData = { ...user, companyIds: updatedCompanyIds };

        delete updatedData.companies;

        const response = await updateUser(user.id, updatedData);

        return response.data;
    } catch (error) {
        console.error(`Error updating companies for user with ID ${user.id}:`, error.message);
        throw error;
    }
};

// Delete a user by ID
export const deleteUser = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Error deleting user with ID ${id}:`, error.message);
        throw error;
    }
};

// Remove a specific company from the user's company list
export const removeCompanyFromUser = async (userId, companyId) => {
    try {
        const user = await getUserById(userId);

        const updatedCompanyIds = user.companyIds.filter(
            (company) => company.companyId !== companyId
        );

        const updatedData = { ...user, companyIds: updatedCompanyIds };

        const response = await updateUser(userId, updatedData);
        return response.data;
    } catch (error) {
        console.error(
            `Error removing company with ID ${companyId} from user with ID ${userId}:`,
            error.message
        );
        throw error;
    }
};
