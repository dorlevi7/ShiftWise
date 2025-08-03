// Import chat service layer
const chatService = require('../services/chatService');

// Send a group chat message
exports.sendGroupMessage = async (req, res) => {
    const { companyId } = req.params;
    const messageData = req.body;

    try {
        await chatService.saveGroupMessage(companyId, messageData);
        res.status(200).json({ message: 'Group message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Send a private message between two users
exports.sendPrivateMessage = async (req, res) => {
    const { companyId, user1Id, user2Id } = req.params;
    const messageData = req.body;

    try {
        await chatService.savePrivateMessage(companyId, user1Id, user2Id, messageData);
        res.status(200).json({ message: 'Private message sent successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all group messages for a specific company
exports.getGroupMessages = async (req, res) => {
    const { companyId } = req.params;

    try {
        const messages = await chatService.getGroupMessages(companyId);
        res.status(200).json(messages || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all private messages between two users
exports.getPrivateMessages = async (req, res) => {
    const { companyId, user1Id, user2Id } = req.params;

    try {
        const messages = await chatService.getPrivateMessages(companyId, user1Id, user2Id);
        res.status(200).json(messages || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark a private conversation as "seen" by a specific viewer
exports.markPrivateSeen = async (req, res) => {
    const { companyId, user1Id, user2Id, viewerId } = req.params;

    try {
        await chatService.markPrivateSeen(companyId, user1Id, user2Id, viewerId);
        res.status(200).json({ message: 'Seen status updated successfully!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get the last seen timestamp for a private conversation
exports.getPrivateLastSeen = async (req, res) => {
    const { companyId, user1Id, user2Id, viewerId } = req.params;

    try {
        const lastSeen = await chatService.getPrivateLastSeen(companyId, user1Id, user2Id, viewerId);
        res.status(200).json({ lastSeen });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
