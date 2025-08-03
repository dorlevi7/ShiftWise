// Import React and hooks
import React, { useState, useEffect } from 'react';

// Import React Router components
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import screen components
import LoginScreen from './components/LoginScreen';
import SignupScreen from './components/SignupScreen';
import HomeScreen from './components/HomeScreen';
import ProfileScreen from './components/ProfileScreen';
import AvailabilityScreen from './components/AvailabilityScreen';
import EmployeesScreen from './components/EmployeesScreen';
import ScheduleScreen from './components/ScheduleScreen';
import NotificationsScreen from './components/NotificationsScreen';
import ChatScreen from './components/ChatScreen';
import ContactListScreen from './components/ContactListScreen';
import StatisticsScreen from './components/StatisticsScreen';

function App() {
    // State to store the logged-in user
    const [user, setUser] = useState(null);

    // Load user data from local storage on initial render
    useEffect(() => {
        try {
            const loggedUser = JSON.parse(localStorage.getItem('user'));
            if (loggedUser) {
                setUser(loggedUser);
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }, []);

    return (
        // Wrap the app in a Router for client-side routing
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<LoginScreen />} />
                    <Route path="/signup" element={<SignupScreen />} />
                    <Route path="/home" element={user ? <HomeScreen /> : <LoginScreen />} />
                    <Route path="/profile" element={user ? <ProfileScreen /> : <LoginScreen />} />
                    <Route path="/availability" element={user ? <AvailabilityScreen /> : <LoginScreen />} />
                    <Route path="/employees" element={user ? <EmployeesScreen /> : <LoginScreen />} />
                    <Route path="/schedule" element={user ? <ScheduleScreen /> : <LoginScreen />} />
                    <Route path="/notifications" element={user ? <NotificationsScreen /> : <LoginScreen />} />
                    <Route path="/chat" element={user ? <ChatScreen /> : <LoginScreen />} />
                    <Route path="/private-chat/:recipientId" element={<ChatScreen />} />
                    <Route path="/phonebook" element={<ContactListScreen />} />
                    <Route path="/statistics" element={user ? <StatisticsScreen /> : <LoginScreen />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
