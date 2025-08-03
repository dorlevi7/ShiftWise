// Import Firebase database reference
const db = require('../config/firebase');

// Save a message written by the admin for the company
exports.saveAdminMessage = async (companyId, message) => {
    const ref = db.ref(`/companies/${companyId}/adminMessage`);
    await ref.set(message);
};

// Retrieve the admin message for a specific company
exports.getAdminMessage = async (companyId) => {
    const ref = db.ref(`/companies/${companyId}/adminMessage`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};
