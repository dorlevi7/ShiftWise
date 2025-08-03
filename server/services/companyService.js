// Import Firebase database reference
const db = require('../config/firebase');

// Get all companies from the database
exports.getCompanies = async () => {
    const ref = db.ref('/companies');
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
};

// Get a single company by its ID
exports.getCompanyById = async (id) => {
    const ref = db.ref(`/companies/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }
    return snapshot.val();
};

// Add a new company and return its ID
exports.addCompany = async (company) => {
    const ref = db.ref('/companies');
    const newRef = await ref.push(company);
    return { id: newRef.key, ...company };
};

// Update a company's data by ID
exports.updateCompany = async (id, updatedData) => {
    const ref = db.ref(`/companies/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }
    await ref.update(updatedData);
    return { id, ...updatedData };
};

// Delete a company by ID
exports.deleteCompany = async (id) => {
    const ref = db.ref(`/companies/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }
    await ref.remove();
};

// Add an employee to the company's employeeIds list
exports.addEmployeeToCompany = async (companyId, userId) => {
    const companyRef = db.ref(`/companies/${companyId}`);
    const snapshot = await companyRef.once('value');

    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }

    const employeeIdsRef = db.ref(`/companies/${companyId}/employeeIds`);
    const employeeSnapshot = await employeeIdsRef.once('value');
    const employeeIds = employeeSnapshot.val() || [];

    // Add user if not already in the list
    if (!employeeIds.includes(userId)) {
        employeeIds.push(userId);
        await employeeIdsRef.set(employeeIds);
    }
};

// Assign an admin to the company and ensure they are in the employeeIds list
exports.addAdminToCompany = async (companyId, adminId) => {
    const companyRef = db.ref(`/companies/${companyId}`);
    const snapshot = await companyRef.once('value');

    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }

    // Set adminId
    const adminRef = db.ref(`/companies/${companyId}/adminId`);
    await adminRef.set(adminId);

    // Ensure admin is included in the employee list
    const employeeIdsRef = db.ref(`/companies/${companyId}/employeeIds`);
    const employeeSnapshot = await employeeIdsRef.once('value');
    const employeeIds = employeeSnapshot.val() || [];

    if (!employeeIds.includes(adminId)) {
        employeeIds.push(adminId);
        await employeeIdsRef.set(employeeIds);
    }

    return { success: true, message: 'Admin added to company successfully' };
};

// Remove a user from the company's employeeIds list
exports.removeUserFromCompany = async (companyId, userId) => {
    const companyRef = db.ref(`/companies/${companyId}`);
    const snapshot = await companyRef.once('value');

    if (!snapshot.exists()) {
        throw new Error('Company not found');
    }

    const employeeIdsRef = db.ref(`/companies/${companyId}/employeeIds`);
    const employeeSnapshot = await employeeIdsRef.once('value');
    const employeeIds = employeeSnapshot.val() || [];

    // Filter out the removed user
    const updatedEmployeeIds = employeeIds.filter((id) => id !== userId);

    await employeeIdsRef.set(updatedEmployeeIds);
};
