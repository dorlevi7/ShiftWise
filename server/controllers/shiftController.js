// Import shift service layer
const shiftService = require('../services/shiftService');

// Get all shifts from the database
exports.getShifts = async (req, res) => {
    try {
        const shifts = await shiftService.getShifts();
        res.json(shifts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a specific shift by ID
exports.getShiftById = async (req, res) => {
    try {
        const shift = await shiftService.getShiftById(req.params.id);
        if (shift) {
            res.json(shift);
        } else {
            res.status(404).json({ message: 'Shift not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new shift
exports.addShift = async (req, res) => {
    try {
        const shift = await shiftService.addShift(req.body);
        res.status(201).json(shift);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update an existing shift by ID
exports.updateShift = async (req, res) => {
    try {
        const updatedShift = await shiftService.updateShift(req.params.id, req.body);
        res.status(200).json(updatedShift);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a shift by ID
exports.deleteShift = async (req, res) => {
    try {
        await shiftService.deleteShift(req.params.id);
        res.status(200).json({ message: 'Shift deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
