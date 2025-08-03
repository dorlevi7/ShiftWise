// Import stats service layer
const statsService = require('../services/statsService');

// Save weekly statistics for a specific user
exports.saveWeeklyStats = async (req, res) => {
    const { companyId, year, month, weekKey, userId } = req.params;
    const statsData = req.body;

    try {
        await statsService.saveWeeklyStats(companyId, year, month, weekKey, userId, statsData);
        res.status(200).json({ message: 'Weekly stats saved successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get weekly statistics for a specific user
exports.getWeeklyStats = async (req, res) => {
    const { companyId, year, month, weekKey, userId } = req.params;

    try {
        const stats = await statsService.getWeeklyStats(companyId, year, month, weekKey, userId);
        res.status(200).json(stats || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update weekly statistics for a specific user
exports.updateWeeklyStats = async (req, res) => {
    const { companyId, year, month, weekKey, userId } = req.params;
    const updatedStats = req.body;

    try {
        await statsService.updateWeeklyStats(companyId, year, month, weekKey, userId, updatedStats);
        res.status(200).json({ message: 'Weekly stats updated successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete weekly statistics for a specific user
exports.deleteWeeklyStats = async (req, res) => {
    const { companyId, year, month, weekKey, userId } = req.params;

    try {
        await statsService.deleteWeeklyStats(companyId, year, month, weekKey, userId);
        res.status(200).json({ message: 'Weekly stats deleted successfully.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all weekly stats for a specific user within a given month
exports.getMonthlyStats = async (req, res) => {
    const { companyId, year, month, userId } = req.params;

    try {
        const stats = await statsService.getMonthlyStats(companyId, year, month, userId);
        res.status(200).json(stats || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all weekly stats for a specific user within a given year
exports.getYearlyStats = async (req, res) => {
    const { companyId, year, userId } = req.params;

    try {
        const stats = await statsService.getYearlyStats(companyId, year, userId);
        res.status(200).json(stats || {});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
