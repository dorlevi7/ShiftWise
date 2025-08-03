// React core and hooks for state, effect, and memoization
import React, { useState, useEffect, useCallback } from 'react';

// Modal library for rendering popups
import Modal from 'react-modal';

// Toast notification system
import { toast, ToastContainer } from 'react-toastify';

// Loading spinner component
import { ThreeDots } from 'react-loader-spinner';

// App navigation bar component
import Navbar from '../components/Navbar';

// Loader component for loading states
import Loader from './Common/Loader';

// Layout wrapper for consistent background
import BackgroundWrapper from './Layouts/BackgroundWrapper';

// Modal component for editing user profiles
import EditProfileModal from './Modals/EditProfileModal';

// Component for displaying individual employee cards
import EmployeeCard from '../components/EmployeeCard';

// Modal component for sending messages to employees
import SendNotificationModal from './Modals/SendNotificationModal';

// Modal component for adding a new employee
import AddEmployeeModal from './Modals/AddEmployeeModal';

// Modal for confirming employee deletion
import ConfirmDeleteModal from './Modals/ConfirmDeleteModal';

// Toast styles
import 'react-toastify/dist/ReactToastify.css';

// Component styles for the Employees screen
import '../styles/EmployeesScreen.css';

// Shared styles for the navigation bar
import '../styles/Navbar.css';

// Function to update user data in Firebase
import { updateUser } from '../services/userService';

// Function to send notifications via Firebase
import { sendNotification } from '../services/notificationService';

// Utility for converting a file to base64 format
import { fileToBase64 } from '../utils/fileUtils';

// Utility function to filter employees by criteria
import { filterEmployees } from '../utils/employeeUtils';

// Utility to update local storage with edited user data
import { updateUserInLocalStorage } from '../utils/userUtils';

// Handlers for loading, adding, and deleting employees
import { fetchEmployees, handleLoadEmployeesFromJSON, handleDeleteConfirmed, handleAddEmployee, handleDeleteAllEmployees } from '../utils/employeeHandlers';

Modal.setAppElement('#root');

function EmployeesScreen() {

    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
        name: '', email: '', phone: '', role: 'employee', password: '', photoFile: null
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [loggedUser, setLoggedUser] = useState(null);
    const [isAddEmployeeModalOpen, setIsAddEmployeeModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isConfirmDeleteModalOpen, setIsConfirmDeleteModalOpen] = useState(false);
    const [editEmployee, setEditEmployee] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [openCards, setOpenCards] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [selectedNotificationRecipients, setSelectedNotificationRecipients] = useState([]);
    const [notificationMessage, setNotificationMessage] = useState('');

    // Retrieves the logged-in user from localStorage when the component mounts
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        console.log("🔐 Logged user from localStorage:", loggedUser);
        setLoggedUser(loggedUser);
    }, []);

    // Once the loggedUser state is set, fetch employees for the user's company
    useEffect(() => {
        if (loggedUser) {
            const companyId = loggedUser?.company?.id;
            if (companyId) {
                fetchEmployees(companyId, setEmployees, setError, setIsLoading);
            }
        }
    }, [loggedUser]);

    // Opens the confirmation modal for deleting a specific employee
    const openConfirmDeleteModal = (employee) => {
        setEmployeeToDelete(employee);
        setIsConfirmDeleteModalOpen(true);
    };

    // Closes the delete confirmation modal and resets selected employee
    const closeConfirmDeleteModal = () => {
        setIsConfirmDeleteModalOpen(false);
        setEmployeeToDelete(null);
    };

    // Handles the actual deletion of the confirmed employee
    const handleDeleteConfirmedWrapper = useCallback(() => {
        handleDeleteConfirmed(employeeToDelete, loggedUser, employees, setEmployees, closeConfirmDeleteModal);
    }, [employeeToDelete, loggedUser, employees, setEmployees]);

    // Handles input changes for the add employee form
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewEmployee((prev) => ({ ...prev, [name]: value }));
    }, []);

    // Handles the form submission for adding a new employee
    const handleAddEmployeeWrapper = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        await handleAddEmployee(
            e,
            newEmployee,
            loggedUser,
            employees,
            setEmployees,
            setNewEmployee,
            setIsAddEmployeeModalOpen
        );

        setIsProcessing(false);
    };

    // Toggles the open/close state of an employee card (for showing details)
    const toggleCard = useCallback((id) => {
        setOpenCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    }, []);

    // Opens the edit modal for a specific employee
    const handleEditClick = useCallback((employee) => {
        setEditEmployee(employee);
        setIsEditModalOpen(true);
    }, []);

    // Deletes all employees (non-admin) from the company
    const handleDeleteAllEmployeesWrapper = useCallback(async () => {
        await handleDeleteAllEmployees(loggedUser, employees, setEmployees, setIsProcessing);
    }, [loggedUser, employees, setEmployees, setIsProcessing]);

    // Filters the list of employees based on search query and role filter
    const filteredEmployees = filterEmployees(employees, searchQuery, filterRole);

    return (
        <BackgroundWrapper >

            <div>
                <Navbar />
                <div className="navbar-placeholder"></div>
                <div className="employees-wrapper">

                    <div className="employees-container">

                        <div className="employees-header">
                            <h1>Employees</h1>
                            <img src="/images/ShiftWise_Owl_Employees.png" alt="Logo" className="header-logo" />
                        </div>

                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                                <option value="all">All Roles</option>
                                <option value="employee">Employee</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {isLoading ? (
                            <Loader />
                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : (
                            <div className="employees-cards">
                                {[...filteredEmployees]
                                    .sort((a, b) => a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }))
                                    .map((employee) => (
                                        <EmployeeCard
                                            key={employee.id}
                                            employee={employee}
                                            isOpen={openCards[employee.id]}
                                            onToggle={toggleCard}
                                            onEdit={handleEditClick}
                                            onDelete={openConfirmDeleteModal}
                                            loggedUser={loggedUser}
                                        />
                                    ))}
                            </div>
                        )}

                        {isProcessing && (
                            <ThreeDots
                                height="50"
                                width="50"
                                radius="9"
                                color="#3498db"
                                ariaLabel="processing"
                                wrapperStyle={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}
                                visible={true}
                            />
                        )}

                        <div className="button-group">
                            <button
                                className="toggle-form-button"
                                onClick={() => setIsAddEmployeeModalOpen(true)}
                            >
                                Add New Employee
                            </button>
                            <button
                                className="toggle-form-button"
                                onClick={() => setIsNotificationModalOpen(true)}
                            >
                                Send Notification
                            </button>

                            <button className="toggle-form-button" onClick={() => handleLoadEmployeesFromJSON(loggedUser, setEmployees, setIsProcessing)}>
                                Add Employees from JSON
                            </button>

                            <button
                                className="toggle-form-button delete-all"
                                onClick={handleDeleteAllEmployeesWrapper}
                            >
                                Delete All Non-Admin Employees
                            </button>
                        </div>

                        <SendNotificationModal
                            isOpen={isNotificationModalOpen}
                            onClose={() => setIsNotificationModalOpen(false)}
                            employees={employees}
                            selectedRecipients={selectedNotificationRecipients}
                            setSelectedRecipients={setSelectedNotificationRecipients}
                            message={notificationMessage}
                            setMessage={setNotificationMessage}
                            onSubmit={async (e) => {
                                e.preventDefault();
                                try {
                                    const companyId = loggedUser?.company?.id;
                                    const link = '/schedule';

                                    for (const userId of selectedNotificationRecipients) {
                                        await sendNotification(companyId, userId, notificationMessage.trim(), link);
                                    }

                                    toast.success('Notifications sent!');
                                    setIsNotificationModalOpen(false);
                                    setSelectedNotificationRecipients([]);
                                    setNotificationMessage('');
                                } catch (error) {
                                    toast.error('Failed to send notifications.');
                                    console.error(error);
                                }
                            }}
                        />

                        <ConfirmDeleteModal
                            isOpen={isConfirmDeleteModalOpen}
                            employeeName={employeeToDelete?.name}
                            onConfirm={handleDeleteConfirmedWrapper}
                            onCancel={closeConfirmDeleteModal}
                        />

                        <AddEmployeeModal
                            isOpen={isAddEmployeeModalOpen}
                            onClose={() => setIsAddEmployeeModalOpen(false)}
                            newEmployee={newEmployee}
                            setNewEmployee={setNewEmployee}
                            handleAddEmployee={handleAddEmployeeWrapper}
                            isProcessing={isProcessing}
                        />

                        {isEditModalOpen && editEmployee && (
                            <EditProfileModal
                                isOpen={isEditModalOpen}
                                onClose={() => setIsEditModalOpen(false)}
                                profileUser={editEmployee}
                                setProfileUser={setEditEmployee}
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    try {
                                        if (editEmployee && editEmployee.id) {
                                            let updatedPhotoData = editEmployee.photoData || '';
                                            if (editEmployee.photoFile) {
                                                updatedPhotoData = await fileToBase64(editEmployee.photoFile);
                                            }

                                            const updatedEmployee = await updateUser(editEmployee.id, {
                                                name: editEmployee.name,
                                                email: editEmployee.email,
                                                phone: editEmployee.phone,
                                                role: editEmployee.role,
                                                photoData: updatedPhotoData,
                                            });

                                            setEmployees((prevEmployees) =>
                                                prevEmployees.map((employee) =>
                                                    employee.id === updatedEmployee.id ? updatedEmployee : employee
                                                )
                                            );

                                            if (loggedUser?.user?.id === updatedEmployee.id) {
                                                updateUserInLocalStorage(loggedUser, updatedEmployee);
                                            }

                                            toast.success('Employee updated successfully!');
                                            setIsEditModalOpen(false);
                                        }
                                    } catch (err) {
                                        toast.error('Failed to update employee. Please try again.');
                                        console.error(err);
                                    }
                                }}
                                title="Edit Employee"
                            />
                        )}
                    </div>
                </div>
                <ToastContainer />
            </div>
        </BackgroundWrapper >
    );
}

export default EmployeesScreen;