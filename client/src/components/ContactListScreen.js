// React core hook for state and lifecycle
import React, { useEffect, useState } from 'react';

// Wrapper component for consistent background styling
import BackgroundWrapper from './Layouts/BackgroundWrapper';

// Top navigation bar component
import Navbar from './Navbar';

// Loading spinner component
import Loader from './Common/Loader';

// Utility function to fetch employee data
import { fetchEmployees } from '../utils/employeeHandlers';

// External styles for this screen
import '../styles/ContactListScreen.css';

function ContactListScreen() {
    const [employees, setEmployees] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Scrolls to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Fetches employees from the database when the component mounts
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        const companyId = loggedUser?.company?.id;

        if (companyId) {
            fetchEmployees(companyId, setEmployees, setError, setIsLoading);
        }
    }, []);

    // Filters employees based on the search query (by name or email)
    const filteredEmployees = employees.filter((employee) =>
        employee.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <BackgroundWrapper>
            <Navbar />
            <div className="navbar-placeholder"></div>
            <div className="contact-wrapper">

                <div className="contact-container">

                    <div className="contact-header">
                        <h1>Contact List</h1>
                        <img
                            src="/images/ShiftWise_Owl_Contact.png"
                            alt="ShiftWise Owl"
                            className="contact-logo"
                        />
                    </div>

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />

                    {isLoading ? (
                        <Loader />
                    ) : error ? (
                        <p className="error">{error}</p>
                    ) : (
                        <div className="weekly-schedules">
                            <h3>Employee Contact List</h3>
                            <table className="phonebook-table">
                                <thead>
                                    <tr>
                                        <th>Photo</th>
                                        <th>Name</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees
                                        .sort((a, b) => a.name.localeCompare(b.name, 'he', { sensitivity: 'base' }))
                                        .map((employee) => (
                                            <tr key={employee.id}>
                                                <td>
                                                    <img
                                                        src={employee.photoData || '/images/Profile.jpeg'}
                                                        alt={employee.name}
                                                        className="phonebook-photo"
                                                    />
                                                </td>
                                                <td>{employee.name}</td>
                                                <td>{employee.phone}</td>
                                                <td>{employee.email}</td>
                                                <td>{employee.role}</td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

        </BackgroundWrapper>
    );
}

export default ContactListScreen;
