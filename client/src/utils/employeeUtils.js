// Utility to convert file to base64 string (used for profile photos)
import { fileToBase64 } from './fileUtils';

// Import user and company service functions
import { getUsers, addUser, updateUserCompanies } from '../services/userService';
import { addEmployeeToCompany } from '../services/companyService';
import { toast } from 'react-toastify';

// Convert uploaded photo file to a base64 data URL
export const getPhotoDataUrl = async (file) => {
    return file ? await fileToBase64(file) : '';
};

// Search for an existing user by email
export const findExistingUser = async (email) => {
    const allUsers = await getUsers();
    return Object.values(allUsers).find((user) => user.email === email);
};

// Associate an existing user with the given company and update the UI list if needed
export const associateUserWithCompany = async (user, company, employees, setEmployees) => {
    await updateUserCompanies(user, company);
    await addEmployeeToCompany(company.id, user.id);

    const alreadyInUI = employees.some((emp) => emp.id === user.id);
    if (!alreadyInUI) {
        setEmployees((prev) => [...prev, user]);
    }

    toast.info('User already exists, added to the company.');
};

// Create a new user and associate them with the company, then update the UI
export const createAndAddNewEmployee = async (data, photoData, company, setEmployees) => {
    const added = await addUser({ ...data, photoData });
    await updateUserCompanies(added, company);
    await addEmployeeToCompany(company.id, added.id);
    setEmployees((prev) => [...prev, { id: added.id, ...added }]);
    toast.success('New user added successfully!');
};

// Reset the form fields after adding a new employee
export const resetNewEmployeeForm = (setNewEmployee) => {
    setNewEmployee({
        name: '', email: '', phone: '', role: 'employee', password: '', photoFile: null
    });
};

// Filter employees based on search query and role filter
export const filterEmployees = (employees, searchQuery, filterRole) => {
    return employees.filter((employee) => {
        return (
            (employee.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
                employee.email.toLowerCase().startsWith(searchQuery.toLowerCase())) &&
            (filterRole === 'all' || employee.role === filterRole)
        );
    });
};
