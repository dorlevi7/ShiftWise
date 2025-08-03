// React hooks for state, effect, and refs
import React, { useState, useEffect, useRef } from 'react';
// Hook for navigation between routes
import { useNavigate } from 'react-router-dom';

// Loading spinner component
import Loader from './Common/Loader';
// Layout wrapper with background image
import BackgroundWrapper from './Layouts/BackgroundWrapper';

// Company-related service functions
import { addCompany, getCompanies, addEmployeeToCompany, addAdminToCompany, } from '../services/companyService';

// User-related service functions
import { addUser, updateUserCompanies, getUsers } from '../services/userService';

// Icons used in the signup form
import { FaBuilding, FaEnvelope, FaLock, FaPhone, FaUser } from 'react-icons/fa';

// Toast for showing notifications
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CSS styles for the signup screen
import '../styles/SignupScreen.css';

import { validateSignupForm } from '../utils/validationUtils';

function SignupScreen() {
    const navigate = useNavigate();
    const [company, setCompany] = useState({ name: '', address: '', phone: '', email: '' });
    const [admin, setAdmin] = useState({ name: '', email: '', phone: '', password: '' });
    const [existingCompanies, setExistingCompanies] = useState([]);
    const [existingUsers, setExistingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const fileInputRef = useRef(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Fetch existing companies and users from the database on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const companiesData = await getCompanies();
                setExistingCompanies(companiesData ? Object.values(companiesData) : []);

                const usersData = await getUsers();
                const usersWithIds = usersData
                    ? Object.entries(usersData).map(([id, user]) => ({ id, ...user }))
                    : [];
                setExistingUsers(usersWithIds);
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Handle form input changes and update corresponding state
    const handleChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter((prev) => ({ ...prev, [name]: value }));
    };

    // Handle form submission to register a new company and admin
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        // Validate form inputs
        const errors = validateSignupForm(company, admin);
        if (errors.length > 0) {
            const firstError = errors[0];
            setError(firstError);
            toast.error(firstError, { autoClose: 2000 });
            return;
        }

        try {
            // Check if a company with the same name already exists
            const isCompanyExists = existingCompanies.some(
                (comp) => comp.name.toLowerCase() === company.name.toLowerCase()
            );

            if (isCompanyExists) {
                setError('A company with this name already exists. Please choose a different name.');
                toast.error('A company with this name already exists. Please choose a different name.', {
                    autoClose: 2000,
                });
                return;
            }

            let newCompany = null;
            let adminUserId;

            // If admin email already exists in the system, use existing user
            const existingUser = existingUsers.find(
                (user) => user.email.toLowerCase() === admin.email.toLowerCase()
            );

            if (existingUser) {
                // Add new company and admin user with profile photo
                newCompany = await addCompany(company);
                await updateUserCompanies(existingUser, newCompany);
                adminUserId = existingUser.id;
            } else {
                newCompany = await addCompany(company);

                let photoDataUrl = '/images/Profile.jpeg';
                if (admin.photoFile) {
                    const reader = new FileReader();
                    photoDataUrl = await new Promise((resolve, reject) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(admin.photoFile);
                    });
                }

                const adminUser = {
                    ...admin,
                    role: 'admin',
                    companyId: newCompany.id,
                    photoData: photoDataUrl
                };

                const addedUser = await addUser(adminUser);
                adminUserId = addedUser.id;

                // Register admin as the company's admin
                await addEmployeeToCompany(newCompany.id, addedUser.id);
            }

            await addAdminToCompany(newCompany.id, adminUserId);

            // Show success message and redirect to login
            toast.success('Company and admin registered successfully!', {
                autoClose: 2000,
                onClose: () => navigate('/'),
            });
        } catch (error) {
            console.error('Error registering company and admin:', error);
            setError('Error registering company and admin. Please try again.');
            toast.error('Error registering company and admin. Please try again.', {
                autoClose: 2000,
            });
        }
    };

    return (
        <BackgroundWrapper >
            <div className="signup-wrapper">

                <div className="signup-container">

                    <div className="register-header">
                        <h1>Register a New Company</h1>
                        <img
                            src="/images/ShiftWise_Owl_Signup.png"
                            alt="Register Owl"
                            className="register-logo"
                        />
                    </div>

                    {isLoading ? (
                        <Loader />
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : null}

                    <form onSubmit={handleSubmit} className="signup-form">
                        <h3>Company Details</h3>
                        <div className="form-group">
                            <label>Company Name:</label>
                            <FaBuilding className="signup-input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={company.name}
                                onChange={handleChange(setCompany)}
                                required
                                placeholder="Enter company name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Address:</label>
                            <FaBuilding className="signup-input-icon" />
                            <input
                                type="text"
                                name="address"
                                value={company.address}
                                onChange={handleChange(setCompany)}
                                required
                                placeholder="Enter company address"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone:</label>
                            <FaPhone className="signup-input-icon" />
                            <input
                                type="text"
                                name="phone"
                                value={company.phone}
                                onChange={handleChange(setCompany)}
                                required
                                placeholder="Enter company phone"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <FaEnvelope className="signup-input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={company.email}
                                onChange={handleChange(setCompany)}
                                required
                                placeholder="Enter company email"
                            />
                        </div>

                        <h3>Admin Details</h3>
                        <div className="form-group">
                            <label>Name:</label>
                            <FaUser className="signup-input-icon" />
                            <input
                                type="text"
                                name="name"
                                value={admin.name}
                                onChange={handleChange(setAdmin)}
                                required
                                placeholder="Enter admin name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Email:</label>
                            <FaEnvelope className="signup-input-icon" />
                            <input
                                type="email"
                                name="email"
                                value={admin.email}
                                onChange={handleChange(setAdmin)}
                                required
                                placeholder="Enter admin email"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone:</label>
                            <FaPhone className="signup-input-icon" />
                            <input
                                type="text"
                                name="phone"
                                value={admin.phone}
                                onChange={handleChange(setAdmin)}
                                required
                                placeholder="Enter admin phone"
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <FaLock className="signup-input-icon" />
                            <input
                                type="password"
                                name="password"
                                value={admin.password}
                                onChange={handleChange(setAdmin)}
                                required
                                placeholder="Enter admin password"
                            />
                        </div>
                        <div className="form-group">
                            <label>Profile Photo:</label>
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={(e) => setAdmin((prev) => ({ ...prev, photoFile: e.target.files[0] }))}
                            />

                        </div>
                        {admin.photoFile && (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <img
                                    src={URL.createObjectURL(admin.photoFile)}
                                    alt="Preview"
                                    style={{
                                        width: '100px',
                                        height: '100px',
                                        objectFit: 'cover',
                                        borderRadius: '8px',
                                        margin: '10px 0'
                                    }}
                                />
                                <button
                                    type="button"
                                    className="secondary-button"
                                    onClick={() => {
                                        fileInputRef.current.value = '';
                                        setAdmin((prev) => {
                                            const updated = { ...prev };
                                            delete updated.photoFile;
                                            return updated;
                                        });
                                    }}
                                >
                                    Remove Photo
                                </button>
                            </div>
                        )}

                        <button type="submit" className="primary-button">Register Company and Admin</button>
                        <button
                            type="button"
                            className="link-button"
                            onClick={() => navigate('/')}
                        >
                            Back to Login
                        </button>
                    </form>

                    <ToastContainer />
                </div>
            </div>
        </BackgroundWrapper>
    );
}

export default SignupScreen;
