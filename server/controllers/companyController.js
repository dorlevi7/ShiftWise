// Import service layers for companies and users
const companyService = require('../services/companyService');
const userService = require('../services/userService');

// Get all companies
exports.getCompanies = async (req, res) => {
    try {
        const companies = await companyService.getCompanies();
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single company by ID
exports.getCompanyById = async (req, res) => {
    try {
        const company = await companyService.getCompanyById(req.params.id);
        if (company) {
            res.json(company);
        } else {
            res.status(404).json({ message: 'Company not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a new company
exports.addCompany = async (req, res) => {
    try {
        const company = await companyService.addCompany(req.body);
        res.status(201).json(company);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a company's data by ID
exports.updateCompany = async (req, res) => {
    try {
        const updatedCompany = await companyService.updateCompany(req.params.id, req.body);
        res.status(200).json(updatedCompany);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a company by ID
exports.deleteCompany = async (req, res) => {
    try {
        await companyService.deleteCompany(req.params.id);
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add an employee to a company and also update the user to reflect the company
exports.addEmployeeToCompany = async (req, res) => {
    const { companyId, userId } = req.body;

    try {
        await companyService.addEmployeeToCompany(companyId, userId);
        await userService.addCompanyToUser(userId, companyId);

        res.status(200).json({ success: true, message: 'Employee added to company successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding employee to company', error: error.message });
    }
};

// Add an admin to the company (and to its employee list)
exports.addAdminToCompany = async (req, res) => {
    const { companyId, adminId } = req.body;

    try {
        await companyService.addAdminToCompany(companyId, adminId);

        res.status(200).json({ success: true, message: 'Admin added to company successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error adding admin to company', error: error.message });
    }
};

// Remove a user from a company (both from the company and user sides)
exports.removeUserFromCompany = async (req, res) => {
    const { companyId, userId } = req.body;

    try {
        await userService.removeCompanyFromUser(userId, companyId);
        await companyService.removeUserFromCompany(companyId, userId);

        res.status(200).json({ success: true, message: 'User removed from company successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error removing user from company', error: error.message });
    }
};
