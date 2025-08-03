// React hooks for state and lifecycle
import React, { useEffect, useState } from 'react';
// React Router hook for navigation
import { useNavigate } from 'react-router-dom';

// App navigation bar component
import Navbar from './Navbar';
// Wrapper component for applying background image
import BackgroundWrapper from './Layouts/BackgroundWrapper';
// Loader component shown during loading state
import Loader from './Common/Loader';

// Component-specific styles
import '../styles/HomeScreen.css';
// Shared navbar styles
import '../styles/Navbar.css';

// Functions for retrieving user availability and publish status
import { getAvailability, fetchPublishStatus } from '../services/availabilityService';
// Functions for retrieving and saving admin messages
import { getAdminMessage, saveAdminMessage } from '../services/homeService';

// Utility function for generating the current week's key
import { calculateWeekKey } from '../utils/utils';

// Toast notification system and styles
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function HomeScreen() {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const [scheduleByDate, setScheduleByDate] = useState({ current: [], next: [] });
    const [weeklyStats, setWeeklyStats] = useState({ totalShifts: 0, nextShift: null });
    const [adminMessage, setAdminMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Scrolls to the top of the page when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Fetches the admin message from the database when userData is loaded
    useEffect(() => {
        const fetchAdminMessage = async () => {
            if (userData) {
                try {
                    const messageData = await getAdminMessage(userData.company.id);
                    setAdminMessage(messageData.message || '');
                } catch (error) {
                    console.error('Failed to load admin message:', error);
                }
            }
        };

        fetchAdminMessage();
    }, [userData]);

    // Saves the admin message to the database
    const handleSaveAdminMessage = async () => {
        try {
            setIsSaving(true);
            await saveAdminMessage(userData.company.id, adminMessage);
            toast.success('Message saved!');
        } catch (error) {
            toast.error('Failed to save message');
        } finally {
            setIsSaving(false);
        }
    };

    // Retrieves the logged-in user from localStorage when component mounts
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedUser) {
            navigate('/');
        } else {
            setUserData(loggedUser);
        }
    }, [navigate]);

    // Fetches and prepares the user's upcoming shifts for the current and next week
    useEffect(() => {
        const fetchShifts = async () => {
            if (!userData) return;

            const companyId = userData.company.id;
            const userId = userData.user.id;
            const weekOffsets = [0, 1]; // current and next week
            const allWeeks = {};

            const shifts = ['Morning', 'Noon', 'Evening', 'Night'];
            const shiftTimes = {
                Morning: '06:00-14:00',
                Noon: '10:00-18:00',
                Evening: '14:00-22:00',
                Night: '22:00-06:00',
            };

            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

            for (let offset of weekOffsets) {
                const weekKey = calculateWeekKey(offset);

                // Check if schedule is published
                const statusObj = await fetchPublishStatus(companyId, weekKey);
                const isPublished = statusObj?.status ?? false;

                if (!isPublished) {
                    allWeeks[offset === 0 ? 'current' : 'next'] = [];
                    continue;
                }

                const availability = await getAvailability(companyId, weekKey, userId);

                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() + offset * 7 - startOfWeek.getDay());

                const formatted = [];

                days.forEach((day, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    const dateStr = date.toLocaleDateString('en-GB');

                    shifts.forEach((shift) => {
                        const status = availability?.[shift]?.[day]?.status;
                        if (status === 'selected') {
                            formatted.push({
                                date: dateStr,
                                day,
                                shift,
                                time: shiftTimes[shift],
                            });
                        }
                    });
                });

                allWeeks[offset === 0 ? 'current' : 'next'] = formatted;
            }

            // Combine and sort shifts chronologically
            const allShifts = [...(allWeeks.current || []), ...(allWeeks.next || [])];

            const allShiftsSorted = allShifts.sort((a, b) => {
                const [dayA, monthA, yearA] = a.date.split('/').map(Number);
                const [dayB, monthB, yearB] = b.date.split('/').map(Number);
                const dateA = new Date(yearA, monthA - 1, dayA);
                const dateB = new Date(yearB, monthB - 1, dayB);
                return dateA - dateB;
            });

            // Find the next upcoming shift
            const now = new Date();
            const nextShift = allShiftsSorted.find((item) => {
                const [day, month, year] = item.date.split('/').map(Number);
                const [startHour, startMinute] = item.time.split('-')[0].split(':').map(Number);
                const shiftDateTime = new Date(year, month - 1, day, startHour, startMinute);
                return shiftDateTime >= now;
            });

            setScheduleByDate(allWeeks);
            setWeeklyStats({
                totalShifts: allShifts.length,
                nextShift
            });
        };

        fetchShifts();
    }, [userData]);

    // If user data is not loaded yet, show the loader
    if (!userData) {
        return <Loader />;
    }

    // Returns a greeting string based on the current hour
    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    // Formats today's date in a friendly long format (e.g., "Sunday, 2 August 2025")
    const todayStr = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <BackgroundWrapper>
            <ToastContainer />
            <Navbar />
            <div className="navbar-placeholder"></div>

            <div className="home-wrapper">

                <div className="home-container">

                    <div className="home-header">
                        <h1>{greeting()}, {userData.user.name}!</h1>

                        <img
                            src="/images/ShiftWise_Owl_Home.png"
                            alt="ShiftWise Owl"
                            className="home-logo"
                        />
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '15px',
                        color: '#444',
                        fontWeight: 500,
                        marginBottom: '0px'
                    }}>
                        <div className="today-container">
                            <span>Today is</span>
                            <span className="today-date">{todayStr}</span>
                        </div>
                    </div>

                    <div className="company-inline">
                        <span className="company-label">Company: </span>
                        <span className="company-name">{userData.company?.name || "N/A"}</span>
                    </div>

                    <div className="admin-message-box">
                        <h3>📢 Message from Admin</h3>
                        {userData.user.role === 'admin' ? (
                            <>
                                <textarea
                                    className="admin-message-textarea"
                                    value={adminMessage}
                                    onChange={(e) => setAdminMessage(e.target.value)}
                                />
                                <button
                                    onClick={handleSaveAdminMessage}
                                    className="action-button"
                                    disabled={isSaving}
                                    style={{ marginTop: '10px' }}
                                >
                                    {isSaving ? 'Saving...' : 'Save Message'}
                                </button>
                            </>
                        ) : (
                            <p style={{ whiteSpace: 'pre-wrap' }}>{adminMessage || 'No message from admin yet.'}</p>
                        )}
                    </div>

                    <div className="weekly-schedules">
                        <h3>Shifts for the current week</h3>
                        {scheduleByDate.current.length > 0 ? (
                            <ul>
                                {scheduleByDate.current.map((item, index) => {
                                    const isNextShift =
                                        weeklyStats.nextShift &&
                                        weeklyStats.nextShift.date === item.date &&
                                        weeklyStats.nextShift.shift === item.shift &&
                                        weeklyStats.nextShift.time === item.time;

                                    return (
                                        <li key={index}>
                                            <div className={isNextShift ? 'next-shift' : ''}>
                                                {isNextShift && <span style={{ marginRight: '6px' }}>⏭️</span>}
                                                <strong>{item.date}</strong>
                                                <span style={{ margin: '0 6px' }}>–</span>
                                                {item.shift} – {item.time}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>No shifts scheduled for the current week.</p>
                        )}

                        <h3>Shifts for next week</h3>
                        {scheduleByDate.next.length > 0 ? (
                            <ul>
                                {scheduleByDate.next.map((item, index) => {
                                    const isNextShift =
                                        weeklyStats.nextShift &&
                                        weeklyStats.nextShift.date === item.date &&
                                        weeklyStats.nextShift.shift === item.shift &&
                                        weeklyStats.nextShift.time === item.time;

                                    return (
                                        <li key={index}>
                                            <div className={isNextShift ? 'next-shift' : ''}>
                                                {isNextShift && <span style={{ marginRight: '6px' }}>⏭️</span>}
                                                <strong>{item.date}</strong>
                                                <span style={{ margin: '0 6px' }}>–</span>
                                                {item.shift} – {item.time}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p>No shifts scheduled for next week.</p>
                        )}
                    </div>


                </div>
            </div>
        </BackgroundWrapper>
    );
}

export default HomeScreen;