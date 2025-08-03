// Import Express framework
const express = require('express');

// Create a new Express router
const router = express.Router();

// Import chat controller functions
const {
    sendGroupMessage,
    getGroupMessages,
    sendPrivateMessage,
    getPrivateMessages,
    markPrivateSeen,
    getPrivateLastSeen
} = require('../controllers/chatController');

// Send a group message in a specific company
router.post('/:companyId/group', sendGroupMessage);

// Get all group messages for a specific company
router.get('/:companyId/group', getGroupMessages);

// Send a private message between two users
router.post('/:companyId/private/:user1Id/:user2Id', sendPrivateMessage);

// Get private messages between two users
router.get('/:companyId/private/:user1Id/:user2Id', getPrivateMessages);

// Mark private messages as seen by the viewer
router.post('/:companyId/private/:user1Id/:user2Id/seen/:viewerId', markPrivateSeen);

// Get the last seen timestamp for a private conversation viewer
router.get('/:companyId/private/:user1Id/:user2Id/last-seen/:viewerId', getPrivateLastSeen);

// Export the router to be used in the main app
module.exports = router;
