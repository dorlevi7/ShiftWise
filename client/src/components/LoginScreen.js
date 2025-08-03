// React hooks for managing component state and side effects
import React, { useState, useEffect } from 'react';
// React Router hook for programmatic navigation
import { useNavigate } from 'react-router-dom';

// FontAwesome icons used in the login form
import { FaEnvelope, FaLock, FaBuilding } from 'react-icons/fa';

// Authentication service for handling login
import { login } from '../services/authService';

// Loader component displayed during login processing
import Loader from './Common/Loader';
// Wrapper component for displaying background image
import BackgroundWrapper from './Layouts/BackgroundWrapper';

// Component-specific styles for login screen
import '../styles/LoginScreen.css';

import { validateLoginForm } from '../utils/validationUtils';

function LoginScreen() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        companyName: '',
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const [isLoading, setIsLoading] = useState(false);

    // Scrolls to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Handles the login form submission
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevents default form submission behavior
        setError('');
        setIsLoading(true); // Shows loading state

        // Validates the form data and sets an error if any
        const validationErrors = validateLoginForm(formData);
        if (validationErrors.length > 0) {
            setError(validationErrors[0]); // Shows only the first error message
            setIsLoading(false);
            return;
        }

        try {
            // Sends login request to the server
            const response = await login(formData);
            if (response.success) {
                // Stores user and company data in localStorage
                const userWithCompany = {
                    user: response.user,
                    company: response.company,
                };
                localStorage.setItem('user', JSON.stringify(userWithCompany));
                // Navigates to home screen with state
                navigate('/home', { state: { user: response.user, company: response.company } });
            } else {
                // Shows server-side error message
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            // Catches unexpected server or network errors
            setError('An error occurred. Please try again later.');
        } finally {
            // Ends loading state
            setIsLoading(false);
        }
    };

    // Shows a loader while logging in
    if (isLoading) return <Loader />;

    return (
        <BackgroundWrapper>
            <div className="login-wrapper">

                <div className="login-container">
                    <div className="login-card">
                        <div className="login-header">
                            <h1>ShiftWise</h1>
                            <img
                                src="/images/ShiftWise_Owl.png"
                                alt="ShiftWise Owl"
                                className="login-logo"
                            />
                        </div>
                        <p className="subtitle">Please login to continue</p>
                        <form onSubmit={handleLogin}>
                            <div className="form-group">
                                <label htmlFor="companyName">Company Name</label>
                                <div className="input-wrapper">
                                    <FaBuilding className="login-input-icon" />
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        placeholder="Enter your company name"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <div className="input-wrapper">
                                    <FaEnvelope className="login-input-icon" />
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <FaLock className="login-input-icon" />
                                    <input
                                        type="password"
                                        id="password"
                                        name="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            {error && <p className="error">{error}</p>}
                            <button type="submit" className="primary-button">Login</button>
                        </form>
                        <p className="signup-prompt">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                className="link-button"
                                onClick={() => navigate('/signup')}
                            >
                                Sign up
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}

export default LoginScreen;