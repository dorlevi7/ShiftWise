// Import Firebase database reference
const db = require('../config/firebase');

// Save a new notification for a user with timestamp and unread status
async function saveNotification(companyId, userId, notificationData) {
    const ref = db.ref(`notifications/${companyId}/${userId}`);
    const newNotificationRef = ref.push();
    await newNotificationRef.set({
        ...notificationData,
        timestamp: new Date().toISOString(),
        read: false,
    });
}

// Retrieve all notifications for a specific user in a company
async function getNotifications(companyId, userId) {
    const ref = db.ref(`notifications/${companyId}/${userId}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
}

// Mark a specific notification as read
async function markNotificationAsRead(companyId, userId, notificationId) {
    const ref = db.ref(`notifications/${companyId}/${userId}/${notificationId}/read`);
    await ref.set(true);
}

// Export notification-related functions
module.exports = {
    saveNotification,
    getNotifications,
    markNotificationAsRead
};
