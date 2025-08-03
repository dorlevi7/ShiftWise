// Import Firebase database reference
const db = require('../config/firebase');

// Retrieve all users from the database
exports.getUsers = async () => {
    const ref = db.ref('/users');
    const snapshot = await ref.once('value');
    return snapshot.val() || {};
};

// Retrieve a single user by ID
exports.getUserById = async (id) => {
    const ref = db.ref(`/users/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('User not found');
    }
    return snapshot.val();
};

// Add a new user and return their ID
exports.addUser = async (user) => {
    const ref = db.ref('/users');
    const newRef = await ref.push(user);
    return { id: newRef.key, ...user };
};

// Update user data by ID
exports.updateUser = async (id, updatedData) => {
    const ref = db.ref(`/users/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('User not found');
    }
    await ref.update(updatedData);
    return { id, ...updatedData };
};

// Delete a user by ID
exports.deleteUser = async (id) => {
    const ref = db.ref(`/users/${id}`);
    const snapshot = await ref.once('value');
    if (!snapshot.exists()) {
        throw new Error('User not found');
    }
    await ref.remove();
};

// Associate a company with a user (adds to companyIds list)
exports.addCompanyToUser = async (userId, companyId) => {
    const userRef = db.ref(`/users/${userId}`);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
        throw new Error('User not found');
    }

    // Remove legacy single companyId field
    await userRef.child('companyId').remove();

    // Get current list of associated companies
    const companyIdsRef = db.ref(`/users/${userId}/companyIds`);
    const companySnapshot = await companyIdsRef.once('value');
    const companyIds = companySnapshot.val() || [];

    // Get company name from DB
    const companyRef = db.ref(`/companies/${companyId}`);
    const companyDataSnapshot = await companyRef.once('value');
    const companyData = companyDataSnapshot.val();

    if (!companyData) {
        throw new Error('Company not found');
    }

    // Prepare company info object to add
    const companyInfo = {
        companyId: companyId,
        companyName: companyData.name,
    };

    // Add company only if not already associated
    const isCompanyAdded = companyIds.some(item => item.companyId === companyId);
    if (!isCompanyAdded) {
        companyIds.push(companyInfo);
        await companyIdsRef.set(companyIds);
    }
};

// Remove a company association from a user's companyIds list
exports.removeCompanyFromUser = async (userId, companyId) => {
    const userRef = db.ref(`/users/${userId}`);
    const snapshot = await userRef.once('value');

    if (!snapshot.exists()) {
        throw new Error('User not found');
    }

    const user = snapshot.val();

    // Filter out the company to be removed
    const updatedCompanyIds = user.companyIds
        ? user.companyIds.filter((company) => company.companyId !== companyId)
        : [];

    await userRef.update({ companyIds: updatedCompanyIds });

    return { success: true, message: `Company with ID ${companyId} removed from user ${userId}` };
};


