// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import user controller
const userController = require('../controllers/userController');

// Get all users
router.get('/', userController.getUsers);

// Get a specific user by ID
router.get('/:id', userController.getUserById);

// Add a new user
router.post('/', userController.addUser);

// Update a user's data by ID
router.put('/:id', userController.updateUser);

// Delete a user by ID
router.delete('/:id', userController.deleteUser);

// Add a company to the user's list of associated companies
router.put('/:id/companies', userController.updateUserCompanies);

// Remove a company from the user's list of associated companies
router.put('/:id/remove-company', userController.removeCompanyFromUser);

// Export the router to be used in the main app
module.exports = router;
