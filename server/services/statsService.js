// Import Firebase database reference
const db = require('../config/firebase');

// Helper function to build the database reference for a user's weekly stats
const buildStatsRef = (companyId, year, month, weekKey, userId) => {
    return db.ref(`/companies/${companyId}/weeklyStats/${year}/${month}/${weekKey}/${userId}`);
};

// Save full weekly stats data for a specific user
exports.saveWeeklyStats = async (companyId, year, month, weekKey, userId, statsData) => {
    const ref = buildStatsRef(companyId, year, month, weekKey, userId);
    await ref.set(statsData);
};

// Retrieve weekly stats for a specific user
exports.getWeeklyStats = async (companyId, year, month, weekKey, userId) => {
    const ref = buildStatsRef(companyId, year, month, weekKey, userId);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Update existing weekly stats for a specific user
exports.updateWeeklyStats = async (companyId, year, month, weekKey, userId, updatedStats) => {
    const ref = buildStatsRef(companyId, year, month, weekKey, userId);
    await ref.update(updatedStats);
};

// Delete weekly stats entry for a specific user
exports.deleteWeeklyStats = async (companyId, year, month, weekKey, userId) => {
    const ref = buildStatsRef(companyId, year, month, weekKey, userId);
    await ref.remove();
};

// Get all weekly stats for a user within a specific month
exports.getMonthlyStats = async (companyId, year, month, userId) => {
    const ref = db.ref(`/companies/${companyId}/weeklyStats/${year}/${month}`);
    const snapshot = await ref.once('value');
    const allWeeks = snapshot.val() || {};

    const result = {};

    // Filter and collect only the stats of the requested user
    Object.entries(allWeeks).forEach(([weekKey, users]) => {
        if (users[userId]) {
            result[weekKey] = users[userId];
        }
    });

    return result;
};

// Get all stats for a user for the entire year, grouped by month and week
exports.getYearlyStats = async (companyId, year, userId) => {
    const ref = db.ref(`/companies/${companyId}/weeklyStats/${year}`);
    const snapshot = await ref.once('value');
    const allMonths = snapshot.val() || {};

    const result = {};

    // Traverse months and weeks to extract user-specific stats
    Object.entries(allMonths).forEach(([month, weeks]) => {
        Object.entries(weeks).forEach(([weekKey, users]) => {
            if (users[userId]) {
                if (!result[month]) result[month] = {};
                result[month][weekKey] = users[userId];
            }
        });
    });

    return result;
};
