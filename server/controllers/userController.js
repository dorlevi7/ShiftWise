// Import user service layer
const userService = require('../services/userService');

// Get all users from the database
exports.getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new user to the database
exports.addUser = async (req, res) => {
    try {
        const user = await userService.addUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user's data by ID
exports.updateUser = async (req, res) => {
    try {
        const updatedUser = await userService.updateUser(req.params.id, req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        await userService.deleteUser(req.params.id);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a company to the user's list of associated companies
exports.updateUserCompanies = async (req, res) => {
    try {
        const userId = req.params.id;
        const { companyId } = req.body;
        const updatedUser = await userService.updateUserCompanies(userId, companyId);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove a company from the user's list of associated companies
exports.removeCompanyFromUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const { companyId } = req.body;
        await userService.removeCompanyFromUser(userId, companyId);
        res.status(200).json({ message: 'Company removed from user successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
