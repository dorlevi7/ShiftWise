// Import Firebase Admin SDK
const admin = require('firebase-admin');

// Load service account credentials (make sure the path is correct)
const serviceAccount = require('../serviceAccountKey.json'); // וודא שהנתיב מדויק

// Initialize Firebase Admin with credentials and Realtime Database URL
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shiftwise-88bad-default-rtdb.europe-west1.firebasedatabase.app",
});

// Export the database reference for use across the app
module.exports = admin.database();