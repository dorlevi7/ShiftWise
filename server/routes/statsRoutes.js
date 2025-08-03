// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import stats controller functions
const {
    saveWeeklyStats,
    getWeeklyStats,
    updateWeeklyStats,
    deleteWeeklyStats,
    getMonthlyStats,
    getYearlyStats
} = require('../controllers/statsController');

// Save weekly statistics for a specific user
router.post('/:companyId/:year/:month/:weekKey/:userId', saveWeeklyStats);

// Get weekly statistics for a specific user
router.get('/:companyId/:year/:month/:weekKey/:userId', getWeeklyStats);

// Update weekly statistics for a specific user
router.put('/:companyId/:year/:month/:weekKey/:userId', updateWeeklyStats);

// Delete weekly statistics for a specific user
router.delete('/:companyId/:year/:month/:weekKey/:userId', deleteWeeklyStats);

// Get all weekly statistics for a specific user in a given month
router.get('/:companyId/:year/:month/:userId', getMonthlyStats);

// Get all statistics for a specific user in a given year
router.get('/:companyId/:year/:userId', getYearlyStats);

// Export the router to be used in the main app
module.exports = router;
