// Import Firebase database reference
const db = require('../config/firebase');

// Save a group chat message under a unique timestamp ID
exports.saveGroupMessage = async (companyId, messageData) => {
    const messageId = Date.now().toString();
    const ref = db.ref(`/companies/${companyId}/chat/group/${messageId}`);
    await ref.set(messageData);
};

// Retrieve all group chat messages for the company
exports.getGroupMessages = async (companyId) => {
    const ref = db.ref(`/companies/${companyId}/chat/group`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Save a private message between two users with a consistent key
exports.savePrivateMessage = async (companyId, user1Id, user2Id, messageData) => {
    const key = [user1Id, user2Id].sort().join('_');
    const messageId = Date.now().toString();
    const ref = db.ref(`/companies/${companyId}/chat/private/${key}/${messageId}`);

    // Add timestamp to the message
    const fullMessage = {
        ...messageData,
        timestamp: Date.now(),
    };

    await ref.set(fullMessage);
};

// Retrieve all private messages between two users
exports.getPrivateMessages = async (companyId, user1Id, user2Id) => {
    const key = [user1Id, user2Id].sort().join('_');
    const ref = db.ref(`/companies/${companyId}/chat/private/${key}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};

// Save the last seen timestamp for private messages, per viewer
exports.markPrivateSeen = async (companyId, user1Id, user2Id, viewerId) => {
    const key = [user1Id, user2Id].sort().join('_');
    const ref = db.ref(`/companies/${companyId}/chat/lastSeen/private/${key}/${viewerId}`);
    await ref.set(Date.now());
};

// Get the last seen timestamp for a specific viewer in a private chat
exports.getPrivateLastSeen = async (companyId, user1Id, user2Id, viewerId) => {
    const key = [user1Id, user2Id].sort().join('_');
    const ref = db.ref(`/companies/${companyId}/chat/lastSeen/private/${key}/${viewerId}`);
    const snapshot = await ref.once('value');
    return snapshot.val();
};
