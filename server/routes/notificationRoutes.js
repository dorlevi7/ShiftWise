// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import notification controller
const notificationController = require('../controllers/notificationController');

// Get all notifications for a specific user in a company
router.get('/:companyId/:userId', notificationController.getNotifications);

// Send a new notification to a specific user
router.post('/:companyId/:userId', notificationController.sendNotification);

// Mark a specific notification as read
router.post('/:companyId/:userId/:notificationId/read', notificationController.markAsRead);

// Export the router to be used in the main app
module.exports = router;
