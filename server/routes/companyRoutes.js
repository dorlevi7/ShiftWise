// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import company controller
const companyController = require('../controllers/companyController');

// Get all companies
router.get('/', companyController.getCompanies);

// Get a specific company by ID
router.get('/:id', companyController.getCompanyById);

// Add a new company
router.post('/', companyController.addCompany);

// Add an employee to a company
router.post('/add-employee', companyController.addEmployeeToCompany);

// Update a company's data by ID
router.put('/:id', companyController.updateCompany);

// Delete a company by ID
router.delete('/:id', companyController.deleteCompany);

// Add an admin to a company (and ensure they're added to employee list)
router.post('/add-admin', companyController.addAdminToCompany);

// Remove a user from a company's employee list
router.post('/remove-user', companyController.removeUserFromCompany);

// Export the router to be used in the main app
module.exports = router;
