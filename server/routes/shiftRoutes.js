// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import shift controller
const shiftController = require('../controllers/shiftController');

// Get all shifts
router.get('/', shiftController.getShifts);

// Add a new shift
router.post('/', shiftController.addShift);

// Delete a shift by ID
router.delete('/:id', shiftController.deleteShift);

// Export the router to be used in the main app
module.exports = router;
