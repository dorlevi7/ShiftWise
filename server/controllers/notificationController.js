// Import notification service layer
const notificationService = require('../services/notificationService');

// Send a new notification to a specific user
exports.sendNotification = async (req, res) => {
    try {
        const { userId, companyId } = req.params;
        const { message, linkTo, meta = {} } = req.body;

        await notificationService.saveNotification(companyId, userId, {
            message,
            linkTo,
            meta,
        });

        res.status(201).json({ message: 'Notification added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all notifications for a specific user
exports.getNotifications = async (req, res) => {
    try {
        const { userId, companyId } = req.params;
        const notifications = await notificationService.getNotifications(companyId, userId);
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a specific notification as read
exports.markAsRead = async (req, res) => {
    try {
        const { userId, companyId, notificationId } = req.params;
        await notificationService.markNotificationAsRead(companyId, userId, notificationId);
        res.status(200).json({ message: 'Notification marked as read' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
