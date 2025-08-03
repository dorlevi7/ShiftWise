// Validates email using a stricter and widely accepted pattern
const isValidEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return typeof email === 'string' && regex.test(email.trim());
};

// Validates phone numbers with 9–15 digits
const isValidPhone = (phone) => {
    const trimmed = phone.trim();
    const regex = /^\+?\d{9,15}$/;
    return typeof phone === 'string' && regex.test(trimmed);
};

// Checks that the value is not just spaces or empty
const isNonEmpty = (value) => {
    return typeof value === 'string' && value.trim().replace(/\s/g, '') !== '';
};

// Validates a name: only Hebrew/English letters and single spaces between words
const isValidName = (name) => {
    const trimmed = name.trim();
    const regex = /^[A-Za-zא-ת]+(?:\s[A-Za-zא-ת]+)*$/;
    return typeof name === 'string' && regex.test(trimmed);
};

// Validates password: at least 8 characters, includes uppercase, lowercase, and a digit
const isStrongPassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&^#_~()-=+]{8,}$/;
    return typeof password === 'string' && regex.test(password);
};

// Validates the entire signup form and returns an array of error messages
const validateSignupForm = (company, admin) => {
    const errors = [];

    // Company validation
    if (!isNonEmpty(company.name)) errors.push('Company name is required.');
    if (!isNonEmpty(company.address)) errors.push('Company address is required.');
    if (!isValidPhone(company.phone)) errors.push('Invalid company phone number.');
    if (!isValidEmail(company.email)) errors.push('Invalid company email address.');

    // Admin validation
    if (!isValidName(admin.name)) errors.push('Admin name must contain only letters and single spaces.');
    if (!isValidPhone(admin.phone)) errors.push('Invalid admin phone number.');
    if (!isValidEmail(admin.email)) errors.push('Invalid admin email address.');
    if (!isStrongPassword(admin.password)) {
        errors.push('Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one digit.');
    }

    return errors;
};

// Validates the login form and returns an array of error messages
const validateLoginForm = ({ email, password, companyName }) => {
    const errors = [];

    if (!isNonEmpty(companyName)) {
        errors.push('Company name is required.');
    }

    if (!isValidEmail(email)) {
        errors.push('Invalid email address.');
    }

    if (!isNonEmpty(password)) {
        errors.push('Password is required.');
    }

    return errors;
};

module.exports = {
    isValidEmail,
    isValidPhone,
    isNonEmpty,
    isValidName,
    isStrongPassword,
    validateSignupForm,
    validateLoginForm
};
