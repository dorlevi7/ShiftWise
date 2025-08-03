// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import admin message controller functions
const {
    saveAdminMessage,
    getAdminMessage
} = require('../controllers/homeController');

// Save an admin message for a specific company
router.post('/:companyId/adminMessage', saveAdminMessage);

// Get the admin message for a specific company
router.get('/:companyId/adminMessage', getAdminMessage);

// Export the router to be used in the main app
module.exports = router;
