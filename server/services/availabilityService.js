// Import Firebase database reference
const db = require('../config/firebase');

// Save a user's full weekly availability
exports.saveAvailability = async (companyId, weekKey, userId, availability) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/${userId}`);
    await ref.set(availability);
};

// Get a user's availability for a specific week
exports.getAvailability = async (companyId, weekKey, userId) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/${userId}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Save user's weekly notes (comments for the week)
exports.saveWeeklyNotes = async (companyId, weekKey, userId, notes) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/${userId}/notes`);
    await ref.set(notes);
};

// Get all users' availabilities for a specific week
exports.getAllAvailabilities = async (companyId, weekKey) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}`);
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
};

// Update the status of a specific shift on a specific day for a user
exports.updateAvailabilityStatus = async (companyId, weekKey, userId, shift, day, status) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/${userId}/${shift}/${day}/status`);
    await ref.set(status);
};

// Save the required number of employees for each shift in the week
exports.saveNecessaryEmployees = async (companyId, weekKey, necessaryEmployees) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/necessaryEmployees`);
    await ref.set(necessaryEmployees);
};

// Get the required number of employees for each shift
exports.getNecessaryEmployees = async (companyId, weekKey) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/necessaryEmployees`);
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
};

// Save weekly shift targets per user (e.g., how many shifts each user should get)
exports.saveWeeklyShiftTargets = async (companyId, weekKey, weeklyShiftTargets) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/weeklyShiftTargets`);
    await ref.set(weeklyShiftTargets);
};

// Get weekly shift targets per user
exports.getWeeklyShiftTargets = async (companyId, weekKey) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/weeklyShiftTargets`);
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
};

// Save whether the schedule has been published for a specific week
exports.savePublishStatus = async (companyId, weekKey, status) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/publishStatus`);
    await ref.set(status);
};

// Get the publish status for a specific week
exports.getPublishStatus = async (companyId, weekKey) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/publishStatus`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Save whether editing availability is allowed for a specific week
exports.saveEditStatus = async (companyId, weekKey, isEditAllowed) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/editStatus`);
    await ref.set(isEditAllowed);
};

// Get the edit status for a specific week
exports.getEditStatus = async (companyId, weekKey) => {
    const ref = db.ref(`/companies/${companyId}/availability/${weekKey}/editStatus`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Save a vacation request under a specific user and request ID
exports.saveVacationRequest = async (companyId, userId, requestId, vacationData) => {
    const ref = db.ref(`/companies/${companyId}/vacationRequests/${userId}/${requestId}`);
    await ref.set(vacationData);
};

// Update the status of a specific vacation request
exports.updateVacationStatus = async (companyId, userId, requestId, status) => {
    const ref = db.ref(`/companies/${companyId}/vacationRequests/${userId}/${requestId}`);
    await ref.update({ status });
};

// Get the data of a specific vacation request
exports.getVacationRequest = async (companyId, userId, requestId) => {
    const ref = db.ref(`/companies/${companyId}/vacationRequests/${userId}/${requestId}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};
