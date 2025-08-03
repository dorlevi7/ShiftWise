// Import Firebase database reference
const db = require('../config/firebase');

// Retrieve all shifts from the database
exports.getShifts = async () => {
    const ref = db.ref('/shifts');
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Retrieve a specific shift by ID
exports.getShiftById = async (id) => {
    const ref = db.ref(`/shifts/${id}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Add a new shift and return its generated ID
exports.addShift = async (shift) => {
    const ref = db.ref('/shifts');
    const newRef = await ref.push(shift);
    return { id: newRef.key, ...shift };
};

// Update a specific shift by ID with new data
exports.updateShift = async (id, updatedData) => {
    const ref = db.ref(`/shifts/${id}`);
    await ref.update(updatedData);
    return { id, ...updatedData };
};

// Delete a shift by ID
exports.deleteShift = async (id) => {
    const ref = db.ref(`/shifts/${id}`);
    await ref.remove();
};
