// Import toast notifications
import { toast } from 'react-toastify';

// Import user and company service functions
import { getUsers, updateUserCompanies, addUser } from '../services/userService';
import { removeUserFromCompany, addEmployeeToCompany } from '../services/companyService';
import { removeCompanyFromUser } from '../services/userService';

// Import JSON file of employee data
import employeesData from '../data/emps.json';

// Import utility functions for employee handling
import { getPhotoDataUrl, findExistingUser, associateUserWithCompany, createAndAddNewEmployee, resetNewEmployeeForm } from '../utils/employeeUtils';

import { isValidName, isValidEmail, isValidPhone, isStrongPassword } from '../utils/validationUtils';

// Fetch employees belonging to a specific company
export const fetchEmployees = async (companyId, setEmployees, setError, setIsLoading) => {
    try {
        const data = await getUsers();
        const usersWithIds = data ? Object.entries(data).map(([id, user]) => ({ id, ...user })) : [];

        const filtered = usersWithIds.filter((user) =>
            user.companyIds?.some((company) => company.companyId === companyId)
        );

        setEmployees(filtered);
    } catch (err) {
        setError('Failed to fetch employees.');
    } finally {
        setIsLoading(false);
    }
};

// Load new employees from a JSON file and add them to the company
export const handleLoadEmployeesFromJSON = async (loggedUser, setEmployees, setIsProcessing) => {
    try {
        if (!loggedUser || !loggedUser.company) {
            toast.error('No company information found. Please try again.');
            return;
        }

        setIsProcessing(true);

        const companyId = loggedUser.company.id;
        const allUsers = await getUsers();

        // Filter out employees who are already in the company
        const newEmployees = employeesData.filter((employee) => {
            const existingUser = Object.values(allUsers).find((user) => user.email === employee.email);

            if (!existingUser) {
                return true;
            }

            const isInCompany = existingUser.companyIds?.some((company) => company.companyId === companyId);
            return !isInCompany;
        });

        // Add new or associate existing users
        for (const employee of newEmployees) {
            const existingUser = Object.values(allUsers).find((user) => user.email === employee.email);

            if (existingUser) {
                await updateUserCompanies(existingUser, loggedUser.company);
                await addEmployeeToCompany(companyId, existingUser.id);
            } else {
                const addedEmployee = await addUser(employee);
                await updateUserCompanies(addedEmployee, loggedUser.company);
                await addEmployeeToCompany(companyId, addedEmployee.id);
            }
        }

        // Refresh employees list after addition
        const updatedUsers = await getUsers();
        const usersWithIds = Object.entries(updatedUsers).map(([id, user]) => ({ id, ...user }));
        const filteredEmployees = usersWithIds.filter((user) =>
            user.companyIds?.some((company) => company.companyId === companyId)
        );

        setEmployees(filteredEmployees);
        toast.success(`${newEmployees.length} employees added successfully!`);
    } catch (error) {
        toast.error('Failed to load employees from JSON.');
        console.error(error);
    } finally {
        setIsProcessing(false);
    }
};

// Delete a specific employee from the company
export const handleDeleteConfirmed = async (employeeToDelete, loggedUser, employees, setEmployees, closeConfirmDeleteModal) => {
    if (!employeeToDelete) return;
    try {
        const companyId = loggedUser?.company?.id;
        if (!companyId) {
            toast.error('No company information found. Please try again.');
            return;
        }
        await removeCompanyFromUser(employeeToDelete.id, companyId);
        await removeUserFromCompany(companyId, employeeToDelete.id);
        setEmployees(employees.filter((employee) => employee.id !== employeeToDelete.id));
        toast.success('Employee deleted successfully!');
    } catch (err) {
        toast.error('Failed to delete employee.');
        console.error(err);
    } finally {
        closeConfirmDeleteModal();
    }
};

// Add a new employee manually via the form
export const handleAddEmployee = async (e, newEmployee, loggedUser, employees, setEmployees, setNewEmployee, setIsAddEmployeeModalOpen) => {
    e.preventDefault();
    try {

        // Validation before proceeding
        if (!isValidName(newEmployee.name)) return toast.error('Invalid name.');
        if (!isValidEmail(newEmployee.email)) return toast.error('Invalid email.');
        if (!isValidPhone(newEmployee.phone)) return toast.error('Invalid phone number.');
        if (!isStrongPassword(newEmployee.password)) return toast.error('Weak password. Must be at least 8 characters and include uppercase, lowercase, and a number.');

        const company = loggedUser?.company;
        if (!company) return toast.error('No company information found.');

        const photoDataUrl = await getPhotoDataUrl(newEmployee.photoFile);
        const existingUser = await findExistingUser(newEmployee.email);

        if (existingUser) {
            await associateUserWithCompany(existingUser, company, employees, setEmployees);
        } else {
            await createAndAddNewEmployee(newEmployee, photoDataUrl, company, setEmployees);
        }

        resetNewEmployeeForm(setNewEmployee);
        setIsAddEmployeeModalOpen(false);
    } catch (err) {
        toast.error('Failed to add employee.');
        console.error(err);
    }
};

// Delete all non-admin employees from the company
export const handleDeleteAllEmployees = async (loggedUser, employees, setEmployees, setIsProcessing) => {
    try {
        if (!loggedUser || !loggedUser.company) {
            toast.error('No company information found. Please try again.');
            return;
        }

        setIsProcessing(true);

        const companyId = loggedUser.company.id;
        const employeesToDelete = employees.filter(employee => employee.role !== 'admin');

        if (employeesToDelete.length === 0) {
            toast.info('No employees to delete.');
            return;
        }

        for (const employee of employeesToDelete) {
            await removeCompanyFromUser(employee.id, companyId);
            await removeUserFromCompany(companyId, employee.id);
        }

        setEmployees(employees.filter(employee => employee.role === 'admin'));
        toast.success(`${employeesToDelete.length} employees deleted successfully!`);
    } catch (err) {
        toast.error('Failed to delete employees.');
        console.error(err);
    } finally {
        setIsProcessing(false);
    }
};