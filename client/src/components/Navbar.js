// React hooks for managing state and side effects
import React, { useState, useEffect } from 'react';
// React Router components for navigation and linking
import { Link, useNavigate } from 'react-router-dom';

// Styles specific to the navigation bar
import '../styles/Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);

    useEffect(() => {
        const checkUnreadNotifications = async () => {
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            if (!loggedUser) return;

            const userId = loggedUser.user.id;
            const companyId = loggedUser.company.id;

            try {
                // Fetch notifications from Firebase Realtime Database
                const response = await fetch(
                    `https://shiftwise-88bad-default-rtdb.europe-west1.firebasedatabase.app/notifications/${companyId}/${userId}.json`
                );

                const data = await response.json();

                // Check if there are any unread notifications
                const unread = Object.values(data || {}).some(notification => !notification.read);
                setHasUnreadNotifications(unread); // Updates the state
            } catch (error) {
                console.error('Failed to fetch notifications:', error); // Log error
            }
        };

        checkUnreadNotifications(); // Call on component mount
    }, []);

    const loggedUser = JSON.parse(localStorage.getItem('user'));
    const isAdmin = loggedUser?.user?.role === 'admin';

    return (
        <nav className="navbar">
            <ul className="navbar-list">
                <li className="navbar-item">
                    <Link to="/home" className="navbar-link">Home</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/profile" className="navbar-link">Profile</Link>
                </li>
                {isAdmin && (
                    <li className="navbar-item">
                        <Link to="/employees" className="navbar-link">Employees</Link>
                    </li>
                )}
                <li className="navbar-item">
                    <Link to="/availability" className="navbar-link">Availability</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/schedule" className="navbar-link">Schedule</Link>
                </li>
                {isAdmin && (
                    <li className="navbar-item">
                        <Link to="/statistics" className="navbar-link">Statistics</Link>
                    </li>
                )}
                <li className="navbar-item">
                    <Link to="/chat" className="navbar-link">Chat</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/phonebook" className="navbar-link">Contacts</Link>
                </li>
                <li className="navbar-item">
                    <Link to="/notifications" className="navbar-link">
                        Notifications
                        {hasUnreadNotifications && <span className="notification-dot">🔔</span>}
                    </Link>
                </li>
                <li className="navbar-item">
                    <button
                        onClick={() => navigate('/')}
                        className="navbar-link logout-button"
                    >
                        Logout
                    </button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;