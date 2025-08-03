import axios from 'axios';

// Base URL for company-related API requests
const API_URL = 'http://localhost:5000/api/companies';

// Fetch all companies from the server
export const getCompanies = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Fetch a specific company by ID
export const getCompanyById = async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

// Add a new company to the database
export const addCompany = async (companyData) => {
    const response = await axios.post(API_URL, companyData);
    return response.data;
};

// Update an existing company by ID
export const updateCompany = async (id, updatedData) => {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
};

// Delete a company by ID
export const deleteCompany = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

// Add an employee to a specific company
export const addEmployeeToCompany = async (companyId, userId) => {
    const response = await axios.post(`${API_URL}/add-employee`, { companyId, userId });
    return response.data;
};

// Add an admin to a specific company
export const addAdminToCompany = async (companyId, adminId) => {
    const response = await axios.post(`${API_URL}/add-admin`, { companyId, adminId });
    return response.data;
};

// Remove a user from a specific company
export const removeUserFromCompany = async (companyId, userId) => {
    try {
        const response = await axios.post(`${API_URL}/remove-user`, { companyId, userId });
        return response.data;
    } catch (error) {
        console.error(`Error removing user with ID ${userId} from company with ID ${companyId}:`, error.message);
        throw error;
    }
};
