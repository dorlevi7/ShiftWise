// Import the availability service layer
const availabilityService = require('../services/availabilityService');

// Save full availability object for a specific user
exports.saveAvailability = async (req, res) => {
    const { companyId, weekKey, userId } = req.params;
    const availability = req.body;

    try {
        await availabilityService.saveAvailability(companyId, weekKey, userId, availability);
        res.status(200).json({ message: 'Availability saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get availability for a specific user
exports.getAvailability = async (req, res) => {
    const { companyId, weekKey, userId } = req.params;

    try {
        const availability = await availabilityService.getAvailability(companyId, weekKey, userId);
        res.status(200).json(availability || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save weekly notes for a user
exports.saveWeeklyNotes = async (req, res) => {
    const { companyId, weekKey, userId } = req.params;
    const { notes } = req.body;

    try {
        await availabilityService.saveWeeklyNotes(companyId, weekKey, userId, notes);
        res.status(200).json({ message: 'Notes saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all users' availability for a specific week
exports.getAllAvailabilities = async (req, res) => {
    const { companyId, weekKey } = req.params;

    try {
        const availabilities = await availabilityService.getAllAvailabilities(companyId, weekKey);
        res.status(200).json(availabilities || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update the availability status (selected/disabled/default) for a shift
exports.updateAvailabilityStatus = async (req, res) => {
    const { companyId, weekKey, userId } = req.params;
    const { shift, day, status } = req.body;

    try {
        await availabilityService.updateAvailabilityStatus(companyId, weekKey, userId, shift, day, status);
        res.status(200).json({ message: 'Availability status updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save the number of necessary employees for each shift
exports.saveNecessaryEmployees = async (req, res) => {
    const { companyId, weekKey } = req.params;
    const { necessaryEmployees } = req.body;

    try {
        await availabilityService.saveNecessaryEmployees(companyId, weekKey, necessaryEmployees);
        res.status(200).json({ message: 'Necessary employees saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get the number of necessary employees per shift
exports.getNecessaryEmployees = async (req, res) => {
    const { companyId, weekKey } = req.params;

    try {
        const necessaryEmployees = await availabilityService.getNecessaryEmployees(companyId, weekKey);
        res.status(200).json(necessaryEmployees || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save weekly shift targets (number of shifts per user)
exports.saveWeeklyShiftTargets = async (req, res) => {
    const { companyId, weekKey } = req.params;
    const { weeklyShiftTargets } = req.body;

    try {
        await availabilityService.saveWeeklyShiftTargets(companyId, weekKey, weeklyShiftTargets);
        res.status(200).json({ message: 'Weekly shift targets saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get weekly shift targets
exports.getWeeklyShiftTargets = async (req, res) => {
    const { companyId, weekKey } = req.params;

    try {
        const weeklyShiftTargets = await availabilityService.getWeeklyShiftTargets(companyId, weekKey);
        res.status(200).json(weeklyShiftTargets || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save publish status of the schedule (e.g., published/unpublished)
exports.savePublishStatus = async (req, res) => {
    const { companyId, weekKey } = req.params;
    const { publishStatus } = req.body;

    try {
        await availabilityService.savePublishStatus(companyId, weekKey, publishStatus);
        res.status(200).json({ message: 'Publish status saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get publish status
exports.getPublishStatus = async (req, res) => {
    const { companyId, weekKey } = req.params;

    try {
        const publishStatus = await availabilityService.getPublishStatus(companyId, weekKey);
        res.status(200).json(publishStatus || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save whether editing availability is allowed
exports.saveEditStatus = async (req, res) => {
    const { companyId, weekKey } = req.params;
    const { isEditAllowed } = req.body;

    try {
        await availabilityService.saveEditStatus(companyId, weekKey, isEditAllowed);
        res.status(200).json({ message: 'Edit status saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get edit status for a specific week
exports.getEditStatus = async (req, res) => {
    const { companyId, weekKey } = req.params;

    try {
        const editStatus = await availabilityService.getEditStatus(companyId, weekKey);
        res.status(200).json(editStatus || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Save a vacation request for a user
exports.saveVacationRequest = async (req, res) => {
    const { companyId, userId, requestId } = req.params;
    const vacationData = req.body;

    try {
        await availabilityService.saveVacationRequest(companyId, userId, requestId, vacationData);
        res.status(200).json({ message: 'Vacation request saved successfully!' });
    } catch (error) {
        console.error('Error saving vacation request:', error);
        res.status(500).json({ error: 'Failed to save vacation request.' });
    }
};

// Update the status of a vacation request (e.g., approved/rejected)
exports.updateVacationStatus = async (req, res) => {
    const { companyId, userId, requestId } = req.params;
    const { status } = req.body;

    try {
        await availabilityService.updateVacationStatus(companyId, userId, requestId, status);
        res.status(200).json({ message: 'Vacation status updated successfully!' });
    } catch (error) {
        console.error('Error updating vacation status:', error);
        res.status(500).json({ error: 'Failed to update vacation status.' });
    }
};

// Get a specific vacation request
exports.getVacationRequest = async (req, res) => {
    const { companyId, userId, requestId } = req.params;

    try {
        const vacationRequest = await availabilityService.getVacationRequest(companyId, userId, requestId);
        if (vacationRequest) {
            res.status(200).json(vacationRequest);
        } else {
            res.status(404).json({ error: 'Vacation request not found.' });
        }
    } catch (error) {
        console.error('Error fetching vacation request:', error);
        res.status(500).json({ error: 'Failed to fetch vacation request.' });
    }
};
