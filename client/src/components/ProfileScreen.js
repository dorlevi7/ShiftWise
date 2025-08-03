// React hooks for managing component state and side effects
import React, { useState, useEffect } from 'react';
// React Router hook for navigation
import { useNavigate } from 'react-router-dom';
// Modal library for displaying popups
import Modal from 'react-modal';
// Toast notifications for feedback messages
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Icons used in the profile screen
import { FaEnvelope, FaPhone, FaBuilding, FaUserShield } from 'react-icons/fa';

// Navigation bar component
import Navbar from './Navbar';

// Loader component for showing a loading spinner
import Loader from './Common/Loader';

// Wrapper for background image and layout styling
import BackgroundWrapper from './Layouts/BackgroundWrapper';

// Modal component for editing profile details
import EditProfileModal from './Modals/EditProfileModal';

// Service for updating user data
import { updateUser } from '../services/userService';

// Utility functions for managing user data
import { updateUserInLocalStorage, getLoggedInUser, fetchUserFromDB, prepareUpdatedUserData } from '../utils/userUtils';

// Component-specific and global styles
import '../styles/ProfileScreen.css';
import '../styles/Navbar.css';

// Set the root element for the modal accessibility
Modal.setAppElement('#root');

const ProfileScreen = () => {
    const [userData, setUserData] = useState(null);
    const [profileUser, setProfileUser] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    // Scroll to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Load user data from local storage and database on component mount
    useEffect(() => {
        loadUserData();
    }, []);

    // Fetch full user data from local storage and database
    const loadUserData = async () => {
        try {
            // Get user from local storage and redirect if not found
            const loggedUser = getLoggedInUser(navigate);
            if (!loggedUser) return;

            // Set basic user data from local storage
            setUserData(loggedUser);

            // Fetch full user profile from the database
            const matchedUser = await fetchUserFromDB(loggedUser.user.id);
            if (matchedUser) {
                setProfileUser(matchedUser);
                console.log("✅ Full user from DB:", matchedUser);
            }
        } catch (error) {
            console.error("❌ Failed to load user data:", error);
            toast.error("Failed to load profile data.");
        }
    };

    // Handle form submission to update the user's profile
    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            // Prepare and send updated user data to the server
            const updatedData = await prepareUpdatedUserData(profileUser);
            const updated = await updateUser(profileUser.id, updatedData);

            // Update state and local storage with new user data
            setProfileUser(updated);
            updateUserInLocalStorage(userData, updated);

            toast.success('Profile updated!');
            setIsEditModalOpen(false);
        } catch (err) {
            toast.error('Update failed.');
            console.error(err);
        }
    };

    // Show loading spinner until both userData and profileUser are loaded
    if (!userData || !profileUser) return <Loader />;

    return (
        <BackgroundWrapper >
            <>
                <Navbar />
                <div className="navbar-placeholder"></div>
                <div className="profile-wrapper">

                    <div className="profile-container">
                        <div className="profile-info">

                            <div className="profile-header">
                                <h1>My Profile</h1>
                                <img src="/images/ShiftWise_Owl_Profile.png" alt="Logo" className="profile-logo" />
                            </div>

                            <div className="profile-card">
                                <div className="profile-row">
                                    <FaBuilding className="profile-icon" />
                                    <span>{userData.company?.name || 'N/A'}</span>
                                </div>
                                <div className="profile-row">
                                    <FaUserShield className="profile-icon" />
                                    <span>{profileUser.role}</span>
                                </div>
                                <div className="profile-row">
                                    <FaPhone className="profile-icon" />
                                    <span>{profileUser.phone}</span>
                                </div>
                                <div className="profile-row">
                                    <FaEnvelope className="profile-icon" />
                                    <span>{profileUser.email}</span>
                                </div>
                            </div>
                            <img
                                src={profileUser.photoData || '/images/Profile.jpeg'}
                                alt="Profile"
                                className="employee-photo-horizontal"
                            />

                            <div className="profile-buttons-vertical">
                                <button onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
                            </div>

                        </div>
                    </div>
                </div>

                <EditProfileModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    profileUser={profileUser}
                    setProfileUser={setProfileUser}
                    onSubmit={handleUpdate}
                    title="Edit Your Profile"
                />

                <ToastContainer />
            </>
        </BackgroundWrapper >
    );
};

export default ProfileScreen;
