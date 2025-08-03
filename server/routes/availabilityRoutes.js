// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import all availability-related controller functions
const {
    saveAvailability,
    getAvailability,
    saveWeeklyNotes,
    getAllAvailabilities,
    updateAvailabilityStatus,
    saveNecessaryEmployees,
    getNecessaryEmployees,
    saveWeeklyShiftTargets,
    getWeeklyShiftTargets,
    savePublishStatus,
    getPublishStatus,
    saveEditStatus,
    getEditStatus,
    saveVacationRequest,
    updateVacationStatus,
    getVacationRequest
} = require('../controllers/availabilityController');

// Save availability data for a specific user and week
router.post('/:companyId/:weekKey/:userId', saveAvailability);

// Get availability data for a specific user and week
router.get('/:companyId/:weekKey/:userId', getAvailability);

// Save weekly notes for a specific user
router.post('/:companyId/:weekKey/:userId/notes', saveWeeklyNotes);

// Get availability data for all users in a specific week
router.get('/:companyId/:weekKey', getAllAvailabilities);

// Update the status of a specific shift (e.g. selected, default, disabled)
router.patch('/:companyId/:weekKey/:userId/status', updateAvailabilityStatus);

// Save the number of necessary employees for each shift
router.post('/:companyId/:weekKey/necessaryEmployees', saveNecessaryEmployees);

// Get the number of necessary employees for each shift
router.get('/:companyId/:weekKey/necessaryEmployees', getNecessaryEmployees);

// Save shift targets for each user (how many shifts they should get)
router.post('/:companyId/:weekKey/weeklyShiftTargets', saveWeeklyShiftTargets);

// Get shift targets for each user
router.get('/:companyId/:weekKey/weeklyShiftTargets', getWeeklyShiftTargets);

// Save the publish status of the weekly schedule
router.post('/:companyId/:weekKey/publishStatus', savePublishStatus);

// Get the publish status of the weekly schedule
router.get('/:companyId/:weekKey/publishStatus', getPublishStatus);

// Save whether editing availability is allowed for the week
router.post('/:companyId/:weekKey/editStatus', saveEditStatus);

// Get the editing status for the week
router.get('/:companyId/:weekKey/editStatus', getEditStatus);

// Save a vacation request for a specific user
router.post('/:companyId/vacationRequests/:userId/:requestId', saveVacationRequest);

// Update the status of a specific vacation request
router.patch('/:companyId/vacationRequests/:userId/:requestId/status', updateVacationStatus);

// Get a specific vacation request
router.get('/:companyId/vacationRequests/:userId/:requestId', getVacationRequest);

// Export the router to be used in the main app
module.exports = router;
