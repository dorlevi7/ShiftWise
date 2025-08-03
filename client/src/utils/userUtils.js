import { getUsers } from '../services/userService';
import { fileToBase64 } from './fileUtils';

// Prepare updated user data, including photo in Base64 if provided
export const prepareUpdatedUserData = async (user) => {
    const photoData = user.photoFile
        ? await fileToBase64(user.photoFile) // Convert uploaded photo file to Base64
        : user.photoData || ''; // Use existing photo or fallback to empty string

    return {
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        photoData,
    };
};

// Retrieve logged-in user from localStorage; redirect if not found
export const getLoggedInUser = (navigate) => {
    const loggedUser = JSON.parse(localStorage.getItem('user'));
    if (!loggedUser) {
        navigate('/'); // Redirect to login screen
        return null;
    }
    return loggedUser;
};

// Fetch user object from database using user ID
export const fetchUserFromDB = async (userId) => {
    try {
        const allUsers = await getUsers(); // Get all users from DB
        const usersWithIds = Object.entries(allUsers).map(([id, user]) => ({ id, ...user }));
        return usersWithIds.find((u) => u.id === userId); // Find user by ID
    } catch (error) {
        console.error("❌ Error fetching user from DB:", error);
        return null;
    }
};

// Update user data in localStorage after profile edit
export const updateUserInLocalStorage = (userData, updated) => {
    const updatedUser = {
        ...userData,
        user: {
            ...userData.user,
            name: updated.name,
            email: updated.email,
            phone: updated.phone,
            role: updated.role,
            photoData: updated.photoData
        }
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));
};
