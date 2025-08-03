// Import Firebase database reference
const db = require('../config/firebase');
const { validateLoginForm } = require('../utils/validationUtils');

// Handle user login with email, password, and company name
exports.login = async (req, res) => {
    const { email, password, companyName } = req.body;

    try {
        // Validate input
        const errors = validateLoginForm({ email, password, companyName });
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: errors[0] });
        }

        // Find the company by name
        const companyRef = db.ref('/companies');
        const companySnapshot = await companyRef.orderByChild('name').equalTo(companyName).once('value');
        const companyData = companySnapshot.val();

        if (!companyData) {
            return res.status(404).json({ success: false, message: 'Company not found' });
        }

        // Extract company ID
        const companyId = Object.keys(companyData)[0];
        // Find the user by email
        const usersRef = db.ref('/users');
        const userSnapshot = await usersRef
            .orderByChild('email')
            .equalTo(email)
            .once('value');
        const userData = userSnapshot.val();

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Extract user ID and data
        const userId = Object.keys(userData)[0];
        const user = userData[userId];

        // Check if user is linked to the given company
        const userCompanyIds = user.companyIds || [];
        const isValidCompany = userCompanyIds.some(company => company.companyName === companyName);

        // Validate password and company affiliation
        if (user.password !== password || !isValidCompany) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Successful login response
        return res.status(200).json({
            success: true,
            user: { id: userId, name: user.name, role: user.role },
            company: { id: companyId, name: companyData[companyId].name },
        });
    } catch (error) {
        // Handle unexpected server error
        return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};