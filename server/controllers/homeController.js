// Import home service layer
const homeService = require('../services/homeService');

// Save an admin message for the specified company
exports.saveAdminMessage = async (req, res) => {
    const { companyId } = req.params;
    const { message } = req.body;

    try {
        await homeService.saveAdminMessage(companyId, message);
        res.status(200).json({ message: 'Admin message saved successfully!' });
    } catch (error) {
        console.error('Error saving admin message:', error);
        res.status(500).json({ error: 'Failed to save admin message.' });
    }
};

// Retrieve the admin message for the specified company
exports.getAdminMessage = async (req, res) => {
    const { companyId } = req.params;

    try {
        const message = await homeService.getAdminMessage(companyId);
        res.status(200).json({ message: message || '' });
    } catch (error) {
        console.error('Error fetching admin message:', error);
        res.status(500).json({ error: 'Failed to fetch admin message.' });
    }
};
