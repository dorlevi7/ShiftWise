// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import login controller
const loginController = require('../controllers/loginController');

// Handle POST request to /login using the login controller
router.post('/login', loginController.login);

// Export the router to be used in the main app
module.exports = router;
