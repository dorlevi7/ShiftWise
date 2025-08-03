// Import Express framework
const express = require('express');
// Import CORS middleware to handle cross-origin requests
const cors = require('cors');
// Create an Express application
const app = express();
// Define the port the server will run on
const port = 5000;

// Enable CORS for all routes
app.use(cors());

// Parse incoming JSON requests with a size limit
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded data with a size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount company-related routes under /api/companies
app.use('/api/companies', require('./routes/companyRoutes'));

// Mount user-related routes under /api/users
app.use('/api/users', require('./routes/userRoutes'));

// Mount shift-related routes under /api/shifts
app.use('/api/shifts', require('./routes/shiftRoutes'));

// Mount authentication routes under /api/auth
app.use('/api/auth', require('./routes/authRoutes'));

// Mount availability-related routes under /api/availability
app.use('/api/availability', require('./routes/availabilityRoutes'));

// Mount notification-related routes under /api/notifications
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Mount home screen-related routes under /api/home
app.use('/api/home', require('./routes/homeRoutes'));

// Mount chat-related routes under /api/chat
app.use('/api/chat', require('./routes/chatRoutes'));

// Mount statistics-related routes under /api/stats
app.use('/api/stats', require('./routes/statsRoutes'));

// Start the server and listen on the defined port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
