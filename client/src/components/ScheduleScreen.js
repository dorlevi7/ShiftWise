// React hooks for state management and lifecycle
import React, { useState, useEffect } from 'react';
// Hook for accessing route state
import { useLocation } from 'react-router-dom';

// Component for displaying a loading spinner
import Loader from './Common/Loader';
// Layout wrapper with background image
import BackgroundWrapper from './Layouts/BackgroundWrapper';
// Navigation bar component
import Navbar from '../components/Navbar';

// Icons used in the schedule screen
import { FaChevronLeft, FaChevronRight, FaCalendarCheck, FaEdit } from 'react-icons/fa';

// Services for handling availability and scheduling logic
import { updateAvailabilityStatus, getAllAvailabilities, getNecessaryEmployees, saveNecessaryEmployees, saveWeeklyShiftTargets, getWeeklyShiftTargets, fetchPublishStatus, savePublishStatus, saveEditStatus, fetchEditStatus } from '../services/availabilityService';

// Service to fetch user data
import { getUsers } from '../services/userService';

// Service to send notifications
import { sendNotification } from '../services/notificationService';

// Utility functions for scheduling logic
import { calculateWeekKey, calculateWeekRange, selectMorningOrNoonShift, selectNightShift, deselectMorningOrNoonShift, deselectNightShift, handleOtherShiftsOfDayWhenDeselectAShift } from '../utils/utils';

// Toast notifications for user feedback
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// CSS styles for the schedule screen
import '../styles/ScheduleScreen.css';

// Service to save weekly statistics
import { saveWeeklyStats } from '../services/statsService';

function ScheduleScreen() {
    const [availability, setAvailability] = useState({});
    const [users, setUsers] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialWeekOffset = parseInt(queryParams.get('weekOffset'), 10) || 0;
    const [weekOffset, setWeekOffset] = useState(initialWeekOffset);
    const [currentCompany, setCurrentCompany] = useState(null);
    const [weekDates, setWeekDates] = useState([]);
    const [highlightedUser, setHighlightedUser] = useState(null);
    const [selectedUserNotes, setSelectedUserNotes] = useState('');
    const [shiftCounts, setShiftCounts] = useState({});
    const [necessaryEmployees, setNecessaryEmployees] = useState({});
    const [weeklyShiftTargets, setWeeklyShiftTargets] = useState({});
    const [totalNecessaryEmployees, setTotalNecessaryEmployees] = useState(0);
    const [totalAssignedShifts, setTotalAssignedShifts] = useState(0);
    const [totalWeeklyTargets, setTotalWeeklyTargets] = useState(0);
    const [isPublished, setIsPublished] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isEditAllowed, setIsEditAllowed] = useState(false);
    const [mostCriticalShifts, setMostCriticalShifts] = useState([]);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isConfirmingPublish, setIsConfirmingPublish] = useState(false);
    const [isConfirmingEdit, setIsConfirmingEdit] = useState(false);
    const [isWarningVisible, setIsWarningVisible] = useState(false);
    const [isViewingAsEmployee, setIsViewingAsEmployee] = useState(false);
    const [selectedShiftToSwap, setSelectedShiftToSwap] = useState(null);
    const [offerToUserId, setOfferToUserId] = useState('');
    const [shiftOfferParams, setShiftOfferParams] = useState(null);
    const [hasCheckedShiftOffer, setHasCheckedShiftOffer] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [secondSelectedShift, setSecondSelectedShift] = useState(null);

    // Define a set of shift identifiers that are considered Shabbat shifts
    const shabbatShiftsSet = new Set([
        'Friday|Evening',
        'Friday|Night',
        'Saturday|Morning',
        'Saturday|Noon',
        'Saturday|Evening',
    ]);

    // Calculate the number of night, Shabbat, and regular shifts for a specific user
    function calculateShiftStats(availability, userId) {
        const shifts = ['Morning', 'Noon', 'Evening', 'Night'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        // Initialize counters for each type of shift
        let nightShifts = 0;
        let shabbatShifts = 0;
        let regularShifts = 0;

        // Iterate over all days and shifts
        for (const day of days) {
            for (const shift of shifts) {
                const shiftData = availability[userId]?.[shift]?.[day];

                // Count only selected shifts
                if (shiftData?.status === 'selected') {
                    const key = `${day}|${shift}`;
                    // Classify the selected shift into its category
                    if (shabbatShiftsSet.has(key)) {
                        shabbatShifts++;
                    } else if (shift === 'Night') {
                        nightShifts++;
                    } else {
                        regularShifts++;
                    }
                }
            }
        }

        // Return the shift statistics
        return { nightShifts, shabbatShifts, regularShifts };
    }

    // Scroll to top when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Load user from localStorage and set initial state
    useEffect(() => {
        const userFromStorage = JSON.parse(localStorage.getItem('user'));
        setLoggedInUser(userFromStorage);
        setIsAdmin(userFromStorage?.user.role === 'admin');
        setHighlightedUser(userFromStorage?.user.id);
    }, []);

    // Show warning if schedule is published but not fully staffed
    useEffect(() => {
        if (isPublished && !isScheduleFullyStaffed()) {
            setIsWarningVisible(true);
        } else {
            setIsWarningVisible(false);
        }
    }, [availability, necessaryEmployees, isPublished]);

    // Fetch all relevant data when weekOffset changes
    useEffect(() => {
        const fetchAvailabilityAndUsers = async () => {
            try {
                // Get logged-in user and extract company ID
                const loggedUser = JSON.parse(localStorage.getItem('user'));
                const companyId = loggedUser?.company?.id;

                if (!companyId) {
                    setError('No company information found.');
                    return;
                }

                setCurrentCompany(companyId);

                // Calculate the current week's key
                const weekKey = calculateWeekKey(weekOffset);

                // Fetch availability, users, necessary employees, and weekly targets in parallel
                const [availabilityData, usersData, necessaryEmployeesData, weeklyTargetsData] = await Promise.all([
                    getAllAvailabilities(companyId, weekKey),
                    getUsers(),
                    getNecessaryEmployees(companyId, weekKey),
                    getWeeklyShiftTargets(companyId, weekKey),
                ]);

                // Set fetched data to state
                setAvailability(availabilityData || {});
                setUsers(usersData || {});
                setNecessaryEmployees(necessaryEmployeesData || {});
                calculateTotalNecessaryEmployees(necessaryEmployeesData || {});

                // Ensure every user has a weekly target initialized
                const updatedWeeklyTargets = { ...weeklyTargetsData };
                Object.values(usersData).forEach(user => {
                    if (!user?.id) {
                        console.warn("User without ID found:", user);
                        return;
                    }

                    if (!updatedWeeklyTargets[user.id]) {
                        updatedWeeklyTargets[user.id] = 0;
                    }
                });

                setWeeklyShiftTargets(updatedWeeklyTargets);

                // Calculate week dates from Sunday to Saturday
                const startOfWeek = new Date();
                startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7 - startOfWeek.getDay());
                const dates = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    return date.toLocaleDateString('en-GB');
                });
                setWeekDates(dates);

            } catch (err) {
                setError('Failed to fetch data.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAvailabilityAndUsers();
    }, [weekOffset]);

    // Handle changes in weekly shift target for a specific user
    const handleWeeklyShiftTargetChange = async (userId, value) => {
        const parsedValue = Math.min(parseInt(value, 10) || 0, 6);

        // Prevent setting a target lower than the current number of shifts
        if (parsedValue < shiftCounts[userId]) {
            console.warn(`Cannot set target lower than current shifts (${shiftCounts[userId]} shifts for user ${userId}).`);
            return;
        }

        // Update local state for weekly targets
        const updatedTargets = { ...weeklyShiftTargets, [userId]: parsedValue };
        setWeeklyShiftTargets(updatedTargets);

        // Recalculate the total target across all users
        const total = Object.values(updatedTargets).reduce((sum, target) => sum + (target || 0), 0);
        setTotalWeeklyTargets(total);

        // Clean unnecessary keys before saving
        const cleanedTargets = Object.fromEntries(
            Object.entries(updatedTargets).filter(([key]) => key !== 'necessaryEmployees')
        );

        // Save updated targets to the database
        try {
            const weekKey = calculateWeekKey(weekOffset);
            await saveWeeklyShiftTargets(currentCompany, weekKey, cleanedTargets);
        } catch (error) {
            console.error('Failed to save weekly shift targets:', error);
        }
    };

    // Change the displayed week by shifting the week offset
    const handleWeekChange = (direction) => {
        setWeekOffset((prevOffset) => prevOffset + direction);
    };

    // Determine the CSS class for a user's shift button based on their availability status
    const getStatusClass = (status, userId, shift, day) => {
        // Count how many users have selected this specific shift
        const selectedEmployeesCount = Object.entries(availability).filter(([_, userData]) => {
            const availabilityInfo = userData?.[shift]?.[day];
            return availabilityInfo?.status === 'selected';
        }).length;

        // Get the max allowed employees for this shift
        const maxNecessaryEmployees = necessaryEmployees?.[day]?.[shift] || 0;

        // If the shift is full, return disabled style
        if (status === 'default' && selectedEmployeesCount >= maxNecessaryEmployees) {
            return highlightedUser === userId ? 'status-disabled highlighted-user' : 'status-disabled';
        }

        const currentShiftCount = shiftCounts[userId] || 0;
        const maxShiftsAllowed = weeklyShiftTargets[userId] || 0;

        // If the user has reached their weekly target, disable additional selections
        if (status === 'default' && currentShiftCount >= maxShiftsAllowed) {
            return highlightedUser === userId ? 'status-disabled highlighted-user' : 'status-disabled';
        }

        // Highlight the currently logged-in user
        if (highlightedUser === userId) {
            return status === 'disabled' ? 'status-disabled highlighted-user' : `highlighted-user ${status}`;
        }

        // Return appropriate class based on the current status
        if (shiftCounts[userId] >= weeklyShiftTargets[userId]) return 'status-disabled';
        switch (status) {
            case 'selected':
                return 'status-selected';
            case 'disabled':
                return 'status-disabled';
            case 'default':
            default:
                return 'status-default';
        }
    };

    // Handles clicking on an employee: toggles highlighting and fetches their notes
    const handleEmployeeClick = async (userId) => {
        // If already highlighted, unselect
        if (highlightedUser === userId) {
            setHighlightedUser(null);
            setSelectedUserNotes('');
            return;
        }

        // Reset notes and set the newly selected employee
        setSelectedUserNotes('');
        setHighlightedUser(userId);

        // Fetch the notes for the selected user from availability
        if (currentCompany && userId) {
            try {
                const weekKey = calculateWeekKey(weekOffset);
                const availabilityData = await getAllAvailabilities(currentCompany, weekKey);

                const userNotes = availabilityData?.[userId]?.notes || 'No notes available.';
                setSelectedUserNotes(userNotes);
            } catch (err) {
                console.error('Failed to fetch notes:', err);
                setSelectedUserNotes('Error fetching notes.');
            }
        }
    };

    // Update shift counts every time availability data changes
    useEffect(() => {
        if (Object.keys(availability).length > 0) {
            updateShiftCounts();
        }
    }, [availability]);

    // Counts selected shifts per user and in total
    const updateShiftCounts = () => {
        const counts = {};
        let totalShifts = 0;

        Object.entries(availability).forEach(([userId, shifts]) => {
            const userShiftCount = Object.values(shifts).reduce(
                (sum, dayShifts) =>
                    sum +
                    Object.values(dayShifts).filter((shift) => shift.status === 'selected').length,
                0
            );
            counts[userId] = userShiftCount;
            totalShifts += userShiftCount;
        });

        setShiftCounts(counts);
        setTotalAssignedShifts(totalShifts);
    };

    // Save necessaryEmployees to the DB every time it changes (and only after loading finishes)
    useEffect(() => {
        const saveNecessaryEmployeesToDB = async () => {
            try {
                const weekKey = calculateWeekKey(weekOffset);

                if (Object.keys(necessaryEmployees).length > 0) {
                    await saveNecessaryEmployees(currentCompany, weekKey, necessaryEmployees);
                }
            } catch (error) {
                console.error('Failed to save necessary employees:', error);
            }
        };

        if (!isLoading && Object.keys(necessaryEmployees).length > 0) {
            saveNecessaryEmployeesToDB();
        }
    }, [necessaryEmployees, currentCompany]);

    // Handles user click on a shift cell to update its status
    const handleStatusUpdate = async (userId, shift, day, currentStatus) => {
        // Count how many employees have already selected this shift on this day
        const selectedEmployeesCount = Object.entries(availability).filter(([_, userData]) => {
            const availabilityInfo = userData?.[shift]?.[day];
            return availabilityInfo?.status === 'selected';
        }).length;

        // Get the maximum number of employees allowed for this shift
        const maxNecessaryEmployees = necessaryEmployees?.[day]?.[shift] || 0;

        // Prevent selecting if shift is already fully staffed
        if (currentStatus === 'default' && selectedEmployeesCount >= maxNecessaryEmployees) {
            console.warn(`Cannot select more employees for ${shift} on ${day}, as the necessary employees limit (${maxNecessaryEmployees}) is reached.`);
            return;
        }

        // Check if user reached their max allowed shifts for the week
        const currentShiftCount = shiftCounts[userId] || 0;
        const maxShiftsAllowed = weeklyShiftTargets[userId] || 0;

        if (currentStatus === 'default' && currentShiftCount >= maxShiftsAllowed) {
            console.warn(`User ${userId} has reached the maximum number of shifts (${maxShiftsAllowed}).`);
            return;
        }

        // Disabled shifts cannot be toggled
        if (currentStatus === 'disabled') return;

        try {
            // Determine the new status and update availability
            const weekKey = calculateWeekKey(weekOffset);
            const newStatus = currentStatus === 'default' ? 'selected' : 'default';

            const updatedAvailability = { ...availability };

            updatedAvailability[userId][shift][day].status = newStatus;
            // Save status update to DB
            await updateAvailabilityStatus(currentCompany, weekKey, userId, shift, day, newStatus);

            if (newStatus === 'selected') {
                // Disable other shifts on the same day
                for (const otherShift of ['Morning', 'Noon', 'Evening', 'Night']) {
                    if (otherShift !== shift) {
                        updatedAvailability[userId][otherShift][day].status = 'disabled';
                        await updateAvailabilityStatus(currentCompany, weekKey, userId, otherShift, day, 'disabled');
                    }
                }

                // Apply special logic for selecting morning/noon or night shifts
                if (shift === 'Morning' || shift === 'Noon') {
                    await selectMorningOrNoonShift(userId, day, updatedAvailability, weekKey, weekOffset, currentCompany);
                } else if (shift === 'Night') {
                    await selectNightShift(userId, day, updatedAvailability, weekKey, weekOffset, currentCompany);
                }
            } else {
                // If deselected, re-enable shifts as needed
                await handleOtherShiftsOfDayWhenDeselectAShift(userId, day, shift, updatedAvailability, weekKey, currentCompany);

                // Handle reverse logic for deselecting morning/noon or night shifts
                if (shift === 'Morning' || shift === 'Noon') {
                    await deselectMorningOrNoonShift(userId, day, updatedAvailability, weekKey, currentCompany);
                } else if (shift === 'Night') {
                    await deselectNightShift(userId, day, updatedAvailability, weekKey, weekOffset, currentCompany);
                }
            }

            // Save updated availability state and recalculate shift counts
            setAvailability(updatedAvailability);
            updateShiftCounts();

        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    // Get list of users who have any selected or default availability
    const employeesWithAvailability = Object.entries(users)
        .filter(([userId]) =>
            availability[userId] && Object.values(availability[userId]).some((shifts) =>
                Object.values(shifts).some((shift) => shift.status === 'selected' || shift.status === 'default')
            )
        )
        // Sort users alphabetically by name
        .sort(([userIdA], [userIdB]) => {
            const nameA = users[userIdA]?.name?.toLowerCase() || '';
            const nameB = users[userIdB]?.name?.toLowerCase() || '';
            return nameA.localeCompare(nameB);
        });

    // Handle input change for number of necessary employees per shift
    const handleNecessaryEmployeesChange = (day, shift, value) => {
        const updatedNecessaryEmployees = { ...necessaryEmployees };

        // Ensure the day exists in the structure
        if (!updatedNecessaryEmployees[day]) {
            updatedNecessaryEmployees[day] = {};
        }

        const parsedValue = parseInt(value, 10) || 0;

        // Count how many employees are already selected for this shift
        const selectedEmployeesCount = Object.entries(availability).filter(([_, userData]) => {
            const availabilityInfo = userData?.[shift]?.[day];
            return availabilityInfo?.status === 'selected';
        }).length;

        // Prevent setting a lower number than already selected employees
        if (parsedValue < selectedEmployeesCount) {
            return;
        }

        // Update the necessary number of employees for the shift
        updatedNecessaryEmployees[day][shift] = parsedValue;

        // Update state and recalculate totals
        setNecessaryEmployees(updatedNecessaryEmployees);
        calculateTotalNecessaryEmployees(updatedNecessaryEmployees);

        // Save the updated values to the database
        const saveToDB = async () => {
            try {
                const weekKey = calculateWeekKey(weekOffset);
                await saveNecessaryEmployees(currentCompany, weekKey, updatedNecessaryEmployees);
            } catch (error) {
                console.error('Failed to save necessary employees:', error);
            }
        };
        saveToDB();
    };

    // Calculate total number of required employees across all shifts
    const calculateTotalNecessaryEmployees = (necessaryEmployeesData) => {
        let total = 0;
        Object.values(necessaryEmployeesData).forEach((dayData) => {
            Object.values(dayData).forEach((shiftCount) => {
                total += shiftCount || 0;
            });
        });
        setTotalNecessaryEmployees(total);
    };

    // Recalculate total weekly shift targets whenever targets change
    useEffect(() => {
        const total = Object.values(weeklyShiftTargets).reduce((sum, target) => sum + (target || 0), 0);
        setTotalWeeklyTargets(total);
    }, [weeklyShiftTargets]);

    // Toggle the publish status of the weekly schedule
    const togglePublishStatus = async () => {
        // Prevent publishing if not all shifts are staffed
        if (!isPublished && !isScheduleFullyStaffed()) {
            alert('Cannot publish schedule: not all shifts are fully staffed.');
            return;
        }

        try {
            const newStatus = !isPublished;
            const weekKey = calculateWeekKey(weekOffset);

            // Save the new publish status in the database
            await savePublishStatus(currentCompany, weekKey, newStatus);

            if (newStatus) {
                // Filter employees and admins from users
                const employeeList = Object.entries(users).filter(([_, u]) =>
                    ['employee', 'admin'].includes(u.role)
                );

                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                // Save weekly shift stats for each employee
                for (const [employeeId] of employeeList) {
                    const { nightShifts, shabbatShifts, regularShifts } = calculateShiftStats(availability, employeeId);

                    await saveWeeklyStats(
                        currentCompany,
                        year,
                        month,
                        weekKey,
                        employeeId,
                        { nightShifts, shabbatShifts, regularShifts }
                    );
                }

                // Send a notification to each employee about the published schedule
                const weekRange = calculateWeekRange(weekOffset);
                const notificationLink = `/schedule?weekOffset=${weekOffset}`;

                for (const [employeeId] of employeeList) {
                    await sendNotification(
                        currentCompany,
                        employeeId,
                        `Weekly schedule for ${weekRange} has been published.`,
                        notificationLink
                    );
                }
            }

            // Update local publish status
            setIsPublished(newStatus);
        } catch (error) {
            console.error('Failed to toggle publish status:', error);
        }
    };

    // Fetch publish status from the database when component loads or week/company changes
    useEffect(() => {
        const fetchPublishStatusFromDB = async () => {
            try {
                const weekKey = calculateWeekKey(weekOffset);
                const status = await fetchPublishStatus(currentCompany, weekKey);

                setIsPublished(status?.status ?? false);
            } catch (error) {
                console.error('Failed to fetch publish status:', error);
            }
        };

        if (currentCompany) {
            fetchPublishStatusFromDB();
        }
    }, [currentCompany, weekOffset]);

    // Check if all shifts have the required number of employees selected
    const isScheduleFullyStaffed = () => {
        for (const day of Object.keys(necessaryEmployees || {})) {
            for (const shift of Object.keys(necessaryEmployees[day] || {})) {
                const requiredCount = necessaryEmployees[day][shift] || 0;
                const selectedCount = Object.entries(availability).filter(([_, userData]) => {
                    const availabilityInfo = userData?.[shift]?.[day];
                    return availabilityInfo?.status === 'selected';
                }).length;

                if (selectedCount !== requiredCount) {
                    return false;
                }
            }
        }
        return true;
    };

    // Disable the publish button if the schedule is not fully staffed and not already published
    const isPublishButtonDisabled = !isScheduleFullyStaffed() && !isPublished;

    // Check if the user has written weekly notes
    const hasWeeklyNotes = (userId) => {
        const userAvailability = availability[userId];
        return userAvailability && userAvailability.notes && userAvailability.notes.trim() !== '';
    };

    // Initialize isAdmin and highlightedUser from localStorage
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        setIsAdmin(loggedUser?.user.role === 'admin');
        setHighlightedUser(loggedUser?.user.id);
    }, []);

    // Toggle edit mode status for the current week's schedule
    const toggleEditStatus = async () => {
        try {
            const newStatus = !isEditAllowed;
            const weekKey = calculateWeekKey(weekOffset);

            await saveEditStatus(currentCompany, weekKey, newStatus);

            setIsEditAllowed(newStatus);
        } catch (error) {
            console.error('Failed to toggle edit status:', error);
        }
    };

    // Fetch edit mode status from the database when company or week changes
    useEffect(() => {
        const fetchEditStatusFromDB = async () => {
            try {
                const weekKey = calculateWeekKey(weekOffset);
                const status = await fetchEditStatus(currentCompany, weekKey);

                setIsEditAllowed(status?.isEditAllowed ?? false);
            } catch (error) {
                console.error('Failed to fetch edit status:', error);
            }
        };

        if (currentCompany) {
            fetchEditStatusFromDB();
        }
    }, [currentCompany, weekOffset]);

    // Calculate how critical a shift is based on number of selected vs necessary employees
    const calculateShiftCriticality = (day, shift) => {
        const necessary = necessaryEmployees?.[day]?.[shift] || 0;
        const selected = Object.values(availability).filter(userData =>
            userData?.[shift]?.[day]?.status === 'selected'
        ).length;

        // Count how many users have 'default' status and are available
        const defaults = Object.entries(availability)
            .filter(([_, userData]) => {
                const status = userData?.[shift]?.[day]?.status;
                return userData?.[shift]?.[day]?.isAvailable && status !== 'selected' && status !== 'disabled';
            })
            .length;

        // If shift is fully staffed, it's not critical
        if (necessary === selected) return 0;

        // Criticality score: higher when few defaults are available
        return (necessary - selected) / Math.pow((defaults + 1), 2);
    };

    // Find the most critical shifts across all days
    const findMostCriticalShifts = () => {
        let highestCriticality = -Infinity;
        let criticalShifts = [];

        Object.keys(necessaryEmployees || {}).forEach(day => {
            Object.keys(necessaryEmployees[day] || {}).forEach(shift => {
                const criticality = calculateShiftCriticality(day, shift);
                const necessary = necessaryEmployees?.[day]?.[shift] || 0;
                const selected = Object.values(availability).filter(userData =>
                    userData?.[shift]?.[day]?.status === 'selected'
                ).length;

                if (necessary === selected) return;

                if (criticality > highestCriticality) {
                    highestCriticality = criticality;
                    criticalShifts = [{ day, shift }];
                } else if (criticality === highestCriticality && criticality > 0) {
                    criticalShifts.push({ day, shift });
                }
            });
        });

        return criticalShifts;
    };

    // Recalculate the most critical shifts whenever availability or requirements change
    useEffect(() => {
        setMostCriticalShifts(findMostCriticalShifts());
    }, [necessaryEmployees, availability]);

    // Open the confirmation modal for publishing or enabling edit mode
    const openConfirmModal = (actionType) => {
        if (actionType === 'publish') {
            setIsConfirmingPublish(true);
            setIsConfirmingEdit(false);
        } else if (actionType === 'edit') {
            setIsConfirmingEdit(true);
            setIsConfirmingPublish(false);
        }
        setIsConfirmModalOpen(true);
    };

    // Close the confirmation modal
    const closeConfirmModal = () => {
        setIsConfirmModalOpen(false);
    };

    // Generate a shift table (with emojis) for a specific user
    const getUserShiftTable = (userId) => {
        if (!availability[userId]) return [];

        const shifts = ['Morning', 'Noon', 'Evening', 'Night'];
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return shifts.map((shift) => {
            const row = { shift: shift[0] + (shift === 'Night' ? 't' : '') };
            days.forEach((day) => {
                const shiftData = availability[userId]?.[shift]?.[day];
                if (shiftData?.status === 'selected') {
                    row[day] = '✅'; // selected shift
                } else if (shiftData?.isAvailable) {
                    row[day] = '🟠'; // available but not selected
                } else {
                    row[day] = ''; // not available
                }
            });
            return row;
        });
    };

    // Send a shift offer notification to selected users (or all eligible users)
    const handleOfferShift = async () => {
        const weekKey = calculateWeekKey(weekOffset);
        const shift = selectedShiftToSwap.shift;
        const day = selectedShiftToSwap.day;
        const fromUser = selectedShiftToSwap.userId;

        const weekRange = calculateWeekRange(weekOffset);

        let recipients = [];

        // If a specific user was selected for the offer
        if (offerToUserId) {
            recipients.push(offerToUserId);
        } else {
            // Otherwise, find all eligible users for the offered shift
            recipients = Object.entries(users)
                .filter(([id, user]) => {
                    if (id === fromUser) return false;

                    const currentShiftCount = shiftCounts[id] || 0;
                    if (currentShiftCount >= 6) return false;

                    // Reject if already assigned to any shift on the same day
                    const isAssignedThatDay = Object.values(availability?.[id] || {}).some(
                        shiftData => shiftData?.[day]?.status === 'selected'
                    );
                    if (isAssignedThatDay) return false;

                    // Prevent night-to-morning or morning-to-night conflicts
                    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    const currentIndex = days.indexOf(day);
                    const prev = days[currentIndex - 1];
                    const next = days[currentIndex + 1];

                    if (
                        ['Morning', 'Noon'].includes(shift) &&
                        prev &&
                        availability?.[id]?.Night?.[prev]?.status === 'selected'
                    ) return false;

                    if (
                        shift === 'Night' &&
                        next &&
                        (
                            availability?.[id]?.Morning?.[next]?.status === 'selected' ||
                            availability?.[id]?.Noon?.[next]?.status === 'selected'
                        )
                    ) return false;

                    return true;
                })
                .map(([id]) => id);
        }

        // Send notification to each recipient
        for (const recipientId of recipients) {
            const link = `/schedule?weekOffset=${weekOffset}&offerShift=true&offerDay=${day}&shift=${shift}&fromUser=${fromUser}&offeredTo=${recipientId}`;

            await sendNotification(
                currentCompany,
                recipientId,
                `You are offered to take ${shift} shift on ${day} (Week: ${weekRange}) from ${users[fromUser]?.name || 'a colleague'}.`,
                link
            );
        }

        toast.success('Shift offer sent successfully!');
        setSelectedShiftToSwap(null);
        setOfferToUserId('');
    };

    // Check if the logged-in user has received a shift offer via URL parameters
    useEffect(() => {
        if (hasCheckedShiftOffer || isLoading || !loggedInUser) return;

        const offerShift = queryParams.get('offerShift');
        const offerDay = queryParams.get('offerDay');
        const offeredTo = queryParams.get('offeredTo');
        const fromUser = queryParams.get('fromUser');
        const shift = queryParams.get('shift');

        if (
            offerShift === 'true' &&
            offerDay &&
            shift &&
            fromUser &&
            loggedInUser?.user?.id === offeredTo
        ) {
            // Check if the shift is still assigned to the original user
            const isStillOffered = availability?.[fromUser]?.[shift]?.[offerDay]?.status === 'selected';

            if (!isStillOffered) {
                toast.info('This shift offer is no longer available.');
            } else {
                setShiftOfferParams({
                    day: offerDay,
                    shift,
                    fromUser,
                    offeredTo,
                    weekOffset: parseInt(queryParams.get('weekOffset'), 10) || 0,
                });
            }

            setHasCheckedShiftOffer(true);
        }
    }, [location.search, availability, isLoading, loggedInUser]);

    // Admin approval path: Check if admin is approving a shift transfer via URL parameters
    useEffect(() => {
        const approve = queryParams.get('approveShiftTransfer');
        const day = queryParams.get('day');
        const shift = queryParams.get('shift');
        const fromUser = queryParams.get('fromUser');
        const toUser = queryParams.get('toUser');

        if (
            approve === 'true' &&
            day && shift && fromUser && toUser &&
            isAdmin
        ) {
            setShiftOfferParams({
                day,
                shift,
                fromUser,
                offeredTo: toUser,
                weekOffset: parseInt(queryParams.get('weekOffset'), 10) || 0,
                isAdminApproval: true
            });
        }
    }, [location.search, isAdmin]);

    // Handles the process of proposing a shift swap between two users
    const handleSwapProposal = async () => {
        const { shift: myShift, day: myDay, userId: me } = selectedShiftToSwap;
        const { shift: theirShift, day: theirDay, userId: them } = secondSelectedShift;

        const weekKey = calculateWeekKey(weekOffset);
        // Prepare day indices and neighboring days for conflict checks
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const myDayIndex = daysOfWeek.indexOf(myDay);
        const theirDayIndex = daysOfWeek.indexOf(theirDay);
        const dayBeforeMyDay = daysOfWeek[myDayIndex - 1];
        const dayBeforeTheirDay = daysOfWeek[theirDayIndex - 1];
        const dayAfterMyDay = daysOfWeek[myDayIndex + 1];
        const dayAfterTheirDay = daysOfWeek[theirDayIndex + 1];

        // Check if either user is already assigned to another shift on the proposed swap day
        const meAssignedOnTheirDay = Object.entries(availability[me] || {}).some(
            ([_, shiftData]) => shiftData?.[theirDay]?.status === 'selected'
        );
        const themAssignedOnMyDay = Object.entries(availability[them] || {}).some(
            ([_, shiftData]) => shiftData?.[myDay]?.status === 'selected'
        );

        // Check night-before or morning-after conflicts for both users
        const meMorningAfterTheirNight = theirShift === 'Night' &&
            dayAfterTheirDay &&
            ['Morning', 'Noon'].some(s => availability?.[me]?.[s]?.[dayAfterTheirDay]?.status === 'selected');

        const themMorningAfterMyNight = myShift === 'Night' &&
            dayAfterMyDay &&
            ['Morning', 'Noon'].some(s => availability?.[them]?.[s]?.[dayAfterMyDay]?.status === 'selected');

        const meNightAfterMorningBeforeTheirDay = theirShift === 'Night' &&
            dayBeforeTheirDay &&
            ['Morning', 'Noon'].some(s => availability?.[me]?.[s]?.[dayBeforeTheirDay]?.status === 'selected');

        const themNightAfterMorningBeforeMyDay = myShift === 'Night' &&
            dayBeforeMyDay &&
            ['Morning', 'Noon'].some(s => availability?.[them]?.[s]?.[dayBeforeMyDay]?.status === 'selected');

        const meMorningAfterNightBeforeTheirDay = ['Morning', 'Noon'].includes(theirShift) &&
            dayBeforeTheirDay &&
            availability?.[me]?.Night?.[dayBeforeTheirDay]?.status === 'selected';

        const themMorningAfterNightBeforeMyDay = ['Morning', 'Noon'].includes(myShift) &&
            dayBeforeMyDay &&
            availability?.[them]?.Night?.[dayBeforeMyDay]?.status === 'selected';

        // Block swap if any conflict rule is triggered
        if (
            meAssignedOnTheirDay ||
            themAssignedOnMyDay ||
            meMorningAfterTheirNight ||
            themMorningAfterMyNight ||
            meNightAfterMorningBeforeTheirDay ||
            themNightAfterMorningBeforeMyDay ||
            meMorningAfterNightBeforeTheirDay ||
            themMorningAfterNightBeforeMyDay
        ) {
            toast.error("Swap not allowed: Conflict with shift-before/after rules or existing assignments.");
            return;
        }

        // If the admin is performing the swap, apply changes directly to the database and UI
        if (loggedInUser?.user?.role === 'admin') {
            await updateAvailabilityStatus(currentCompany, weekKey, me, myShift, myDay, 'default');
            await updateAvailabilityStatus(currentCompany, weekKey, them, theirShift, theirDay, 'default');
            await updateAvailabilityStatus(currentCompany, weekKey, me, theirShift, theirDay, 'selected');
            await updateAvailabilityStatus(currentCompany, weekKey, them, myShift, myDay, 'selected');

            // Update local availability state
            const updated = { ...availability };
            updated[me][myShift][myDay].status = 'default';
            updated[them][theirShift][theirDay].status = 'default';

            updated[me][theirShift] ||= {};
            updated[me][theirShift][theirDay] ||= { isAvailable: true };
            updated[me][theirShift][theirDay].status = 'selected';

            updated[them][myShift] ||= {};
            updated[them][myShift][myDay] ||= { isAvailable: true };
            updated[them][myShift][myDay].status = 'selected';

            setAvailability(updated);
            updateShiftCounts();

            // Clear selected shifts and show success message
            setSelectedShiftToSwap(null);
            setSecondSelectedShift(null);
            toast.success("Swap completed successfully.");
            return;
        }

        // If non-admin, send a swap request notification to the admin
        const adminId = Object.entries(users).find(([, u]) => u.role === 'admin')?.[0];
        if (!adminId) {
            toast.error('Admin not found.');
            return;
        }

        const notificationLink = `/schedule?weekOffset=${weekOffset}&approveSwap=true&me=${me}&them=${them}&myDay=${myDay}&myShift=${myShift}&theirDay=${theirDay}&theirShift=${theirShift}`;

        await sendNotification(
            currentCompany,
            adminId,
            `${users[me]?.name || 'An employee'} requested to swap their ${myShift} shift on ${myDay} with ${users[them]?.name || 'another employee'}'s ${theirShift} shift on ${theirDay}.`,
            notificationLink
        );

        // Clear selections and notify user
        toast.success('Your swap request has been sent to the admin.');
        setSelectedShiftToSwap(null);
        setSecondSelectedShift(null);
    };

    // Checks the URL for admin swap approval parameters and sets up the swap accordingly
    useEffect(() => {
        // Extract relevant query parameters
        const approveSwap = queryParams.get('approveSwap');
        const me = queryParams.get('me');
        const them = queryParams.get('them');
        const myDay = queryParams.get('myDay');
        const myShift = queryParams.get('myShift');
        const theirDay = queryParams.get('theirDay');
        const theirShift = queryParams.get('theirShift');

        // If all required parameters exist and the user is admin, store the swap details in state
        if (
            approveSwap === 'true' &&
            me && them && myDay && myShift && theirDay && theirShift &&
            isAdmin
        ) {
            setShiftOfferParams({
                isAdminSwapApproval: true,
                me, them, myDay, myShift, theirDay, theirShift,
                weekOffset: parseInt(queryParams.get('weekOffset'), 10) || 0,
            });
        }
    }, [location.search, isAdmin]);

    return (
        <BackgroundWrapper >
            <div>
                <Navbar />
                <ToastContainer />

                {isConfirmModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>
                                {isConfirmingPublish
                                    ? isPublished ? 'Confirm Schedule Unpublishing' : 'Confirm Schedule Publication'
                                    : isConfirmingEdit
                                        ? isEditAllowed ? 'Confirm Disabling Editing' : 'Confirm Enabling Editing'
                                        : ''}
                            </h2>
                            <p>
                                {isConfirmingPublish
                                    ? isPublished ? 'Are you sure you want to unpublish this schedule?' : 'Are you sure you want to publish this schedule?'
                                    : isConfirmingEdit
                                        ? isEditAllowed ? 'Are you sure you want to disable weekly availability submissions?' : 'Are you sure you want to enable weekly availability submissions?'
                                        : ''}
                            </p>
                            <div className="modal-buttons">
                                <button className="confirm-button" onClick={() => {
                                    if (isConfirmingPublish) {
                                        togglePublishStatus();
                                    } else if (isConfirmingEdit) {
                                        toggleEditStatus();
                                    }
                                    closeConfirmModal();
                                }}>
                                    Confirm
                                </button>
                                <button className="cancel-button" onClick={closeConfirmModal}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="navbar-placeholder"></div>

                <div className="schedule-wrapper">

                    <div className="schedule-container">

                        <div className="schedule-header">
                            <h1>Weekly Schedule</h1>
                            <img
                                src="/images/ShiftWise_Owl_Schedule.png"
                                alt="ShiftWise Owl"
                                className="schedule-logo"
                            />
                        </div>

                        {isAdmin && (
                            <div className="view-toggle-container">
                                <button
                                    className="view-toggle-button"
                                    onClick={() => setIsViewingAsEmployee(prev => !prev)}
                                >
                                    {isViewingAsEmployee ? <FaEdit style={{ marginRight: '6px' }} /> : <FaCalendarCheck style={{ marginRight: '6px' }} />}
                                    {isViewingAsEmployee ? 'Back to Draft View' : 'View Final Schedule'}
                                </button>
                            </div>
                        )}

                        {isLoading ? (
                            <Loader />

                        ) : error ? (
                            <p className="error">{error}</p>
                        ) : (
                            <>
                                {!isAdmin && (
                                    <div className="week-navigation centered-navigation">
                                        <button className="navigation-button" onClick={() => handleWeekChange(-1)}>
                                            Previous Week
                                        </button>
                                        <h2 className="week-range">{calculateWeekRange(weekOffset)}</h2>
                                        <button className="navigation-button" onClick={() => handleWeekChange(1)}>
                                            Next Week
                                        </button>
                                    </div>
                                )}

                                {(isAdmin && !isViewingAsEmployee) ? (
                                    <div className="schedule-content">
                                        <table className="schedule-table">
                                            <thead>
                                                <tr>
                                                    <th>Shift</th>
                                                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                                                        (day, index) => (
                                                            <th key={day}>
                                                                {day} <br />
                                                                <span className="date">{weekDates[index]}</span>
                                                            </th>
                                                        )
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {['Morning', 'Noon', 'Evening', 'Night'].map((shift) => (
                                                    <tr key={shift}>
                                                        <td>{shift}</td>
                                                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                                                            const selectedEmployeesCount = Object.entries(availability).filter(([userId, userData]) => {
                                                                const availabilityInfo = userData?.[shift]?.[day];
                                                                return availabilityInfo?.status === 'selected';
                                                            }).length;

                                                            const isFullyStaffed = selectedEmployeesCount === (necessaryEmployees?.[day]?.[shift] || 0);
                                                            const criticality = calculateShiftCriticality(day, shift);
                                                            const isMostCritical = mostCriticalShifts.some(criticalShift =>
                                                                criticalShift.day === day && criticalShift.shift === shift
                                                            );

                                                            return (
                                                                <td
                                                                    key={day}
                                                                    className={`schedule-cell 
                                                                ${isFullyStaffed ? 'fully-staffed' : ''} 
                                                                ${isMostCritical ? 'most-critical' : ''}
                                                            `}
                                                                >
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        className="necessary-employees-input"
                                                                        value={necessaryEmployees?.[day]?.[shift] || 0}
                                                                        onChange={(e) => handleNecessaryEmployeesChange(day, shift, e.target.value)}
                                                                    />

                                                                    <div className="selected-employees-indicator">
                                                                        {selectedEmployeesCount} Selected
                                                                    </div>

                                                                    {Object.entries(availability)
                                                                        .filter(([userId, userData]) => {
                                                                            const availabilityInfo = userData?.[shift]?.[day];
                                                                            return availabilityInfo?.isAvailable;
                                                                        })
                                                                        .sort(([userIdA], [userIdB]) => {
                                                                            const nameA = users[userIdA]?.name || '';
                                                                            const nameB = users[userIdB]?.name || '';
                                                                            return nameA.localeCompare(nameB);
                                                                        })
                                                                        .map(([userId, userData]) => {
                                                                            const availabilityInfo = userData?.[shift]?.[day];
                                                                            const statusClass = getStatusClass(availabilityInfo.status, userId);

                                                                            return (
                                                                                <div
                                                                                    key={userId}
                                                                                    className={`availability-entry ${statusClass}`}
                                                                                    onClick={() =>
                                                                                        handleStatusUpdate(
                                                                                            userId,
                                                                                            shift,
                                                                                            day,
                                                                                            availabilityInfo.status
                                                                                        )
                                                                                    }
                                                                                    style={{
                                                                                        backgroundColor:
                                                                                            availabilityInfo.status === 'selected'
                                                                                                ? '#2ecc71'
                                                                                                : availabilityInfo.status === 'disabled'
                                                                                                    ? '#e74c3c'
                                                                                                    : '#ffff',
                                                                                        color: availabilityInfo.status === 'disabled' ? 'white' : '#2c3e50',
                                                                                        pointerEvents: availabilityInfo.status === 'disabled' ? 'none' : 'auto',
                                                                                        cursor: availabilityInfo.status === 'disabled' ? 'not-allowed' : 'pointer',
                                                                                    }}
                                                                                >
                                                                                    {users[userId]?.name || 'Unknown'}
                                                                                </div>
                                                                            );
                                                                        })}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}

                                            </tbody>
                                        </table>

                                        <div className="employees-list">
                                            <h3>Employees</h3>

                                            <div className="week-navigation">
                                                <button className="week-nav-button" onClick={() => handleWeekChange(-1)}>
                                                    <FaChevronLeft />
                                                </button>
                                                <span className="week-range">{calculateWeekRange(weekOffset)}</span>
                                                <button className="week-nav-button" onClick={() => handleWeekChange(1)}>
                                                    <FaChevronRight />
                                                </button>
                                            </div>

                                            <div className="buttons-container">
                                                {isWarningVisible && (
                                                    <div className="warning-banner">
                                                        ⚠️ Warning: One or more shifts are no longer fully staffed. Please review the schedule.
                                                    </div>
                                                )}

                                                <button
                                                    className={`general-button ${isPublished ? 'green' : 'red'}`}
                                                    onClick={() => openConfirmModal('publish')}
                                                    disabled={isPublishButtonDisabled}
                                                >
                                                    {isPublished ? 'Unpublish Schedule' : 'Publish Schedule'}
                                                    {isWarningVisible && <span className="publish-warning-icon">🔴</span>}
                                                </button>

                                                <button
                                                    className={`general-button ${isEditAllowed ? 'green' : 'red'}`}
                                                    onClick={() => openConfirmModal('edit')}
                                                >
                                                    {isEditAllowed ? 'Disable Editing' : 'Enable Editing'}
                                                </button>

                                            </div>

                                            <div className="total-info-container">
                                                <h3>Weekly Overview</h3>
                                                <hr />
                                                <p>Weekly Staff: <span>{totalNecessaryEmployees}</span></p>
                                                <hr />
                                                <p>Weekly Shift Targets: <span>{totalWeeklyTargets}</span></p>
                                                <hr />
                                                <p>Assigned Shifts: <span>{totalAssignedShifts}</span></p>
                                                <hr />
                                            </div>

                                            <ul>
                                                {employeesWithAvailability.map(([userId, user]) => {
                                                    const isTargetMet = weeklyShiftTargets[userId] === shiftCounts[userId];
                                                    const hasNotes = hasWeeklyNotes(userId);
                                                    const backgroundColor = hasNotes ? 'yellow' : '#2980b9';
                                                    const textColor = hasNotes ? 'black' : 'white';

                                                    return (
                                                        <li
                                                            key={userId}
                                                            onClick={() => handleEmployeeClick(userId)}
                                                            className={`${highlightedUser === userId ? 'selected' : ''} ${isTargetMet ? 'target-met' : ''}`}
                                                            style={{
                                                                backgroundColor: isTargetMet ? '#d4edda' : 'inherit',
                                                            }}
                                                        >
                                                            <div className="employee-details">

                                                                <span
                                                                    className="notes-indicator"
                                                                    style={{
                                                                        backgroundColor: backgroundColor,
                                                                        color: textColor,
                                                                    }}
                                                                >
                                                                    <span className="indicator-text">i</span>
                                                                </span>

                                                                <span className="employee-name">
                                                                    {user.name}
                                                                </span>

                                                                <div className="weekly-shift-target">
                                                                    <label>
                                                                        {shiftCounts[userId] || 0} shifts out of:
                                                                        <input
                                                                            type="number"
                                                                            min="0"
                                                                            max="6"
                                                                            value={weeklyShiftTargets[userId] || 0}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                            onChange={(e) => handleWeeklyShiftTargetChange(userId, e.target.value)}
                                                                            className="weekly-shift-input"
                                                                        />
                                                                    </label>
                                                                </div>

                                                                {highlightedUser === userId && (
                                                                    <>
                                                                        {selectedUserNotes && selectedUserNotes !== 'No notes available.' && (
                                                                            <div className="employee-notes">
                                                                                <h4>Notes:</h4>
                                                                                <p>{selectedUserNotes}</p>
                                                                            </div>
                                                                        )}

                                                                        <div className="employee-table">
                                                                            <div className="mini-schedule-legend compact">
                                                                                <span className="legend-symbol">✅</span> Assigned &nbsp;&nbsp;
                                                                                <span className="legend-symbol">🟠</span> Submitted
                                                                            </div>

                                                                            <table className="mini-schedule-table">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Shift</th>
                                                                                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                                                            <th key={day}>{day}</th>
                                                                                        ))}
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {getUserShiftTable(userId).map((row) => (
                                                                                        <tr key={row.shift}>
                                                                                            <td>
                                                                                                {{
                                                                                                    Morning: 'M',
                                                                                                    Noon: 'N',
                                                                                                    Evening: 'E',
                                                                                                    Night: 'Nt'
                                                                                                }[row.shift] || row.shift}
                                                                                            </td>
                                                                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                                                                                                <td key={day}>{row[day]}</td>
                                                                                            ))}
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                ) : (
                                    isPublished ? (
                                        <div>
                                            <div className="schedule-content">
                                                <table className="schedule-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Shift</th>
                                                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(
                                                                (day, index) => (
                                                                    <th key={day}>
                                                                        {day} <br />
                                                                        <span className="date">{weekDates[index]}</span>
                                                                    </th>
                                                                )
                                                            )}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {['Morning', 'Noon', 'Evening', 'Night'].map((shift) => (
                                                            <tr key={shift}>
                                                                <td>{shift}</td>
                                                                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => {
                                                                    const selectedEmployees = Object.entries(availability).filter(([userId, userData]) => {
                                                                        const availabilityInfo = userData?.[shift]?.[day];
                                                                        return availabilityInfo?.status === 'selected';
                                                                    });

                                                                    return (
                                                                        <td key={day} className="schedule-cell">

                                                                            {selectedEmployees
                                                                                .sort(([userIdA], [userIdB]) => {
                                                                                    const nameA = users[userIdA]?.name?.toLowerCase() || '';
                                                                                    const nameB = users[userIdB]?.name?.toLowerCase() || '';
                                                                                    return nameA.localeCompare(nameB);
                                                                                })
                                                                                .map(([userId]) => {
                                                                                    const isOwnShift = userId === highlightedUser;
                                                                                    const isSelected = selectedShiftToSwap &&
                                                                                        selectedShiftToSwap.userId === userId &&
                                                                                        selectedShiftToSwap.day === day &&
                                                                                        selectedShiftToSwap.shift === shift;

                                                                                    const isOfferedToMe = shiftOfferParams &&
                                                                                        userId === shiftOfferParams.fromUser &&
                                                                                        shift === shiftOfferParams.shift &&
                                                                                        day === shiftOfferParams.day;

                                                                                    const isSecondSelected = secondSelectedShift &&
                                                                                        secondSelectedShift.userId === userId &&
                                                                                        secondSelectedShift.day === day &&
                                                                                        secondSelectedShift.shift === shift;

                                                                                    console.log('[DEBUG] checking cell', {
                                                                                        userId,
                                                                                        shift,
                                                                                        day,
                                                                                        highlightedUser,
                                                                                        isOwnShift,
                                                                                        isSelected,
                                                                                        isOfferedToMe,
                                                                                        shiftOfferParams,
                                                                                    });

                                                                                    return (
                                                                                        <div
                                                                                            key={userId}
                                                                                            className={`employee-button 
                                                                                        ${isOwnShift ? 'highlighted-own-shift' : ''} 
                                                                                        ${isSelected ? 'highlighted-swap-source' : ''} 
                                                                                        ${isSecondSelected ? 'highlighted-swap-target' : ''} 
                                                                                        ${isOfferedToMe ? 'offered-to-me' : ''} 
                                                                                        ${shiftOfferParams?.isAdminSwapApproval &&
                                                                                                    (
                                                                                                        (userId === shiftOfferParams.me &&
                                                                                                            shift === shiftOfferParams.myShift &&
                                                                                                            day === shiftOfferParams.myDay) ||
                                                                                                        (userId === shiftOfferParams.them &&
                                                                                                            shift === shiftOfferParams.theirShift &&
                                                                                                            day === shiftOfferParams.theirDay)
                                                                                                    )
                                                                                                    ? 'highlighted-swap'
                                                                                                    : ''
                                                                                                }
                                                                                    `}

                                                                                            onClick={() => {
                                                                                                if (isOwnShift) {
                                                                                                    if (
                                                                                                        selectedShiftToSwap &&
                                                                                                        selectedShiftToSwap.userId === userId &&
                                                                                                        selectedShiftToSwap.shift === shift &&
                                                                                                        selectedShiftToSwap.day === day
                                                                                                    ) {
                                                                                                        setSelectedShiftToSwap(null);
                                                                                                        setSecondSelectedShift(null);
                                                                                                    } else {
                                                                                                        setSelectedShiftToSwap({ userId, shift, day });
                                                                                                        setSecondSelectedShift(null);
                                                                                                    }
                                                                                                } else if (selectedShiftToSwap && !secondSelectedShift) {
                                                                                                    setSecondSelectedShift({ userId, shift, day });
                                                                                                } else {
                                                                                                    setSelectedShiftToSwap(null);
                                                                                                    setSecondSelectedShift(null);
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            {users[userId]?.name || 'Unknown'}
                                                                                        </div>
                                                                                    );
                                                                                })
                                                                            }
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>

                                                {isAdmin && (
                                                    <div className="employees-list">
                                                        <h3>Employees</h3>
                                                        <ul>
                                                            {employeesWithAvailability.map(([userId, user]) => {
                                                                return (
                                                                    <li
                                                                        key={userId}
                                                                        onClick={() => handleEmployeeClick(userId)}
                                                                        className={`${highlightedUser === userId ? 'selected' : ''}`}
                                                                    >
                                                                        <div className="employee-details">
                                                                            <span className="employee-name">{user.name}</span>
                                                                        </div>
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </div>
                                                )}

                                            </div>
                                            {selectedShiftToSwap && (
                                                secondSelectedShift ? (
                                                    <div className="swap-request-container">
                                                        <h3>Swap Shifts With Another Employee</h3>
                                                        <p>
                                                            You are proposing to swap your <strong>{selectedShiftToSwap.shift}</strong> shift on <strong>{selectedShiftToSwap.day}</strong>
                                                            with <strong>{users[secondSelectedShift.userId]?.name}</strong>'s
                                                            <strong> {secondSelectedShift.shift}</strong> shift on <strong>{secondSelectedShift.day}</strong>.
                                                        </p>
                                                        <div className="swap-form">
                                                            <button
                                                                className="submit-swap-button"
                                                                onClick={handleSwapProposal}
                                                            >
                                                                Propose Swap
                                                            </button>
                                                            <button
                                                                className="submit-swap-button"
                                                                style={{ backgroundColor: '#e74c3c' }}
                                                                onClick={() => {
                                                                    setSelectedShiftToSwap(null);
                                                                    setSecondSelectedShift(null);
                                                                }}
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="swap-request-container">
                                                        <h3>Offer Shift to Another Employee</h3>
                                                        <p>
                                                            You are offering your <strong>{selectedShiftToSwap.shift}</strong> shift on <strong>{selectedShiftToSwap.day}</strong> to another employee.
                                                        </p>
                                                        <div className="swap-form">
                                                            <label>
                                                                Choose employee to offer the shift to:
                                                                <select value={offerToUserId} onChange={(e) => setOfferToUserId(e.target.value)}>
                                                                    <option value="">No one specific</option>
                                                                    {Object.entries(users)
                                                                        .filter(([id, user]) => {
                                                                            if (id === selectedShiftToSwap.userId) return false;

                                                                            if (!user.companyIds?.some((company) => company.companyId === loggedInUser?.company?.id)) return false;

                                                                            if ((shiftCounts[id] || 0) >= 6) return false;

                                                                            const isAssignedThatDay = Object.values(availability?.[id] || {}).some(
                                                                                shiftData => shiftData?.[selectedShiftToSwap.day]?.status === 'selected'
                                                                            );
                                                                            if (isAssignedThatDay) return false;

                                                                            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                                                                            const currentIndex = days.indexOf(selectedShiftToSwap.day);
                                                                            const previousDay = days[currentIndex - 1];
                                                                            const nextDay = days[currentIndex + 1];

                                                                            if (['Morning', 'Noon'].includes(selectedShiftToSwap.shift) &&
                                                                                previousDay &&
                                                                                availability?.[id]?.Night?.[previousDay]?.status === 'selected'
                                                                            ) return false;

                                                                            if (selectedShiftToSwap.shift === 'Night' &&
                                                                                nextDay &&
                                                                                (
                                                                                    availability?.[id]?.Morning?.[nextDay]?.status === 'selected' ||
                                                                                    availability?.[id]?.Noon?.[nextDay]?.status === 'selected'
                                                                                )
                                                                            ) return false;

                                                                            return true;
                                                                        })

                                                                        .sort(([, a], [, b]) => (a.name || '').localeCompare(b.name || ''))
                                                                        .map(([id, user]) => (
                                                                            <option key={id} value={id}>
                                                                                {user.name}
                                                                            </option>
                                                                        ))}
                                                                </select>
                                                            </label>

                                                            <button className="submit-swap-button" onClick={handleOfferShift}>
                                                                Offer Shift
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            )}

                                            {shiftOfferParams &&
                                                loggedInUser?.user?.id === shiftOfferParams.offeredTo &&
                                                availability?.[shiftOfferParams.fromUser]?.[shiftOfferParams.shift]?.[shiftOfferParams.day]?.status === 'selected' && (

                                                    <div className="swap-request-container">
                                                        <h3>You’ve received a shift offer</h3>
                                                        <p>
                                                            You are being offered the <strong>{shiftOfferParams.shift}</strong> shift on <strong>{shiftOfferParams.day}</strong> by{' '}
                                                            <strong>{users[shiftOfferParams.fromUser]?.name || 'a colleague'}</strong>.
                                                        </p>
                                                        <div className="swap-form">
                                                            <button
                                                                className="accept-swap-button"
                                                                onClick={async () => {
                                                                    const weekKey = calculateWeekKey(shiftOfferParams.weekOffset);
                                                                    const { shift, day, fromUser, offeredTo } = shiftOfferParams;

                                                                    const currentStatus = availability?.[fromUser]?.[shift]?.[day]?.status;
                                                                    if (currentStatus !== 'selected') {
                                                                        toast.error('This shift has already been taken by someone else.');
                                                                        setShiftOfferParams(null);
                                                                        return;
                                                                    }

                                                                    const adminId = Object.entries(users).find(([, u]) => u.role === 'admin')?.[0];
                                                                    if (!adminId) {
                                                                        toast.error('Admin not found.');
                                                                        return;
                                                                    }

                                                                    const weekRange = calculateWeekRange(shiftOfferParams.weekOffset);
                                                                    const notificationLink = `/schedule?weekOffset=${shiftOfferParams.weekOffset}&approveShiftTransfer=true&day=${day}&shift=${shift}&fromUser=${fromUser}&toUser=${offeredTo}`;

                                                                    if (adminId === offeredTo) {
                                                                        await updateAvailabilityStatus(currentCompany, weekKey, fromUser, shift, day, 'default');
                                                                        await updateAvailabilityStatus(currentCompany, weekKey, offeredTo, shift, day, 'selected');

                                                                        const updated = { ...availability };
                                                                        updated[fromUser][shift][day].status = 'default';
                                                                        if (!updated[offeredTo]) updated[offeredTo] = {};
                                                                        if (!updated[offeredTo][shift]) updated[offeredTo][shift] = {};
                                                                        if (!updated[offeredTo][shift][day]) updated[offeredTo][shift][day] = { isAvailable: true };
                                                                        updated[offeredTo][shift][day].status = 'selected';

                                                                        setAvailability(updated);
                                                                        updateShiftCounts();

                                                                        toast.success('Shift was successfully reassigned to you.');
                                                                        setShiftOfferParams(null);
                                                                    } else {
                                                                        await sendNotification(
                                                                            currentCompany,
                                                                            adminId,
                                                                            `${users[offeredTo]?.name || 'An employee'} accepted the offer to take the ${shift} shift on ${day}. Please approve the change.`,
                                                                            notificationLink
                                                                        );

                                                                        toast.success('Your request has been sent to the admin for approval.');
                                                                        setShiftOfferParams(null);
                                                                    }
                                                                }}
                                                            >
                                                                Accept Shift
                                                            </button>

                                                            <button
                                                                className="submit-swap-button"
                                                                style={{ backgroundColor: '#e74c3c' }}
                                                                onClick={() => {
                                                                    setShiftOfferParams(null);
                                                                    toast.info('You declined the shift.');
                                                                }}
                                                            >
                                                                Decline
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                            {shiftOfferParams?.isAdminApproval && (
                                                <div className="swap-request-container">
                                                    <h3>Admin Approval Required</h3>
                                                    <p>
                                                        Approve transfer of <strong>{shiftOfferParams.shift} </strong> shift on <strong>{shiftOfferParams.day} </strong>
                                                        from <strong>{users[shiftOfferParams.fromUser]?.name || 'Unknown'} </strong>
                                                        to <strong>{users[shiftOfferParams.offeredTo]?.name || 'Unknown'}</strong>?
                                                    </p>
                                                    <div className="swap-form">
                                                        <button
                                                            className="accept-swap-button"
                                                            onClick={async () => {
                                                                const { shift, day, fromUser, offeredTo, weekOffset } = shiftOfferParams;
                                                                const weekKey = calculateWeekKey(weekOffset);

                                                                const currentStatus = availability?.[fromUser]?.[shift]?.[day]?.status;
                                                                if (currentStatus !== 'selected') {
                                                                    toast.error('This shift has already been reassigned.');
                                                                    setShiftOfferParams(null);
                                                                    return;
                                                                }

                                                                await updateAvailabilityStatus(currentCompany, weekKey, fromUser, shift, day, 'default');
                                                                await updateAvailabilityStatus(currentCompany, weekKey, offeredTo, shift, day, 'selected');

                                                                const updated = { ...availability };
                                                                updated[fromUser][shift][day].status = 'default';
                                                                if (!updated[offeredTo]) updated[offeredTo] = {};
                                                                if (!updated[offeredTo][shift]) updated[offeredTo][shift] = {};
                                                                if (!updated[offeredTo][shift][day]) updated[offeredTo][shift][day] = { isAvailable: true };
                                                                updated[offeredTo][shift][day].status = 'selected';

                                                                setAvailability(updated);
                                                                updateShiftCounts();

                                                                const shabbatShiftsSet = new Set([
                                                                    'Friday|Evening',
                                                                    'Friday|Night',
                                                                    'Saturday|Morning',
                                                                    'Saturday|Noon',
                                                                    'Saturday|Evening',
                                                                ]);
                                                                const isShabbatShift = shabbatShiftsSet.has(`${day}|${shift}`);
                                                                const isNightShift = shift === 'Night' && !isShabbatShift;
                                                                const isRegularShift = !isShabbatShift && shift !== 'Night';

                                                                if (isShabbatShift || isNightShift || isRegularShift) {
                                                                    const now = new Date();
                                                                    const year = now.getFullYear();
                                                                    const month = now.getMonth() + 1;

                                                                    const fromStats = calculateShiftStats(updated, fromUser);
                                                                    const toStats = calculateShiftStats(updated, offeredTo);

                                                                    await saveWeeklyStats(currentCompany, year, month, weekKey, fromUser, fromStats);
                                                                    await saveWeeklyStats(currentCompany, year, month, weekKey, offeredTo, toStats);
                                                                }

                                                                const fromUserName = users[fromUser]?.name || 'Unknown';
                                                                const offeredToName = users[offeredTo]?.name || 'Unknown';
                                                                const link = `/schedule?weekOffset=${weekOffset}`;

                                                                if (fromUser !== loggedInUser?.user?.id) {
                                                                    await sendNotification(
                                                                        currentCompany,
                                                                        fromUser,
                                                                        `The admin approved your request to transfer the ${shift} shift on ${day} to ${offeredToName}.`,
                                                                        link
                                                                    );
                                                                }

                                                                if (offeredTo !== loggedInUser?.user?.id) {
                                                                    await sendNotification(
                                                                        currentCompany,
                                                                        offeredTo,
                                                                        `The admin approved your request to take the ${shift} shift on ${day} from ${fromUserName}.`,
                                                                        link
                                                                    );
                                                                }

                                                                toast.success('Shift transfer approved.');
                                                                setShiftOfferParams(null);
                                                            }}
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            className="submit-swap-button"
                                                            style={{ backgroundColor: '#e74c3c' }}
                                                            onClick={async () => {
                                                                setShiftOfferParams(null);
                                                                toast.info('Shift transfer declined.');

                                                                const { shift, day, fromUser, offeredTo, weekOffset } = shiftOfferParams;

                                                                const fromUserName = users[fromUser]?.name || 'Unknown';
                                                                const offeredToName = users[offeredTo]?.name || 'an employee';
                                                                const weekRange = calculateWeekRange(weekOffset);

                                                                await sendNotification(
                                                                    currentCompany,
                                                                    fromUser,
                                                                    `Your shift offer to ${offeredToName} for the ${shift} shift on ${day} was declined by the admin.`,
                                                                    `/schedule?weekOffset=${weekOffset}`
                                                                );

                                                                await sendNotification(
                                                                    currentCompany,
                                                                    offeredTo,
                                                                    `Your request to take the ${shift} shift on ${day} from ${fromUserName} was declined by the admin.`,
                                                                    `/schedule?weekOffset=${weekOffset}`
                                                                );
                                                            }}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {shiftOfferParams?.isAdminSwapApproval && (
                                                <div className="swap-request-container">
                                                    <h3>Admin Approval Required</h3>
                                                    <p>
                                                        Approve shift swap between{' '}
                                                        <strong>{users[shiftOfferParams.me]?.name || 'Unknown'}</strong>
                                                        (shift: {shiftOfferParams.myShift} on {shiftOfferParams.myDay}) and{' '}
                                                        <strong>{users[shiftOfferParams.them]?.name || 'Unknown'}</strong>
                                                        (shift: {shiftOfferParams.theirShift} on {shiftOfferParams.theirDay})?
                                                    </p>
                                                    <div className="swap-form">
                                                        <button
                                                            className="accept-swap-button"
                                                            onClick={async () => {
                                                                const {
                                                                    me,
                                                                    them,
                                                                    myDay,
                                                                    myShift,
                                                                    theirDay,
                                                                    theirShift,
                                                                    weekOffset,
                                                                } = shiftOfferParams;
                                                                const weekKey = calculateWeekKey(weekOffset);

                                                                const myStatus = availability?.[me]?.[myShift]?.[myDay]?.status;
                                                                const theirStatus = availability?.[them]?.[theirShift]?.[theirDay]?.status;

                                                                if (myStatus !== 'selected' || theirStatus !== 'selected') {
                                                                    toast.error('One of the shifts has already changed.');
                                                                    setShiftOfferParams(null);
                                                                    return;
                                                                }

                                                                await updateAvailabilityStatus(
                                                                    currentCompany,
                                                                    weekKey,
                                                                    me,
                                                                    myShift,
                                                                    myDay,
                                                                    'default'
                                                                );
                                                                await updateAvailabilityStatus(
                                                                    currentCompany,
                                                                    weekKey,
                                                                    them,
                                                                    theirShift,
                                                                    theirDay,
                                                                    'default'
                                                                );
                                                                await updateAvailabilityStatus(
                                                                    currentCompany,
                                                                    weekKey,
                                                                    me,
                                                                    theirShift,
                                                                    theirDay,
                                                                    'selected'
                                                                );
                                                                await updateAvailabilityStatus(
                                                                    currentCompany,
                                                                    weekKey,
                                                                    them,
                                                                    myShift,
                                                                    myDay,
                                                                    'selected'
                                                                );

                                                                const updated = { ...availability };
                                                                updated[me][myShift][myDay].status = 'default';
                                                                updated[them][theirShift][theirDay].status = 'default';

                                                                updated[me][theirShift] ||= {};
                                                                updated[me][theirShift][theirDay] ||= { isAvailable: true };
                                                                updated[me][theirShift][theirDay].status = 'selected';

                                                                updated[them][myShift] ||= {};
                                                                updated[them][myShift][myDay] ||= { isAvailable: true };
                                                                updated[them][myShift][myDay].status = 'selected';

                                                                setAvailability(updated);
                                                                updateShiftCounts();

                                                                // --- עדכון סטטיסטיקות ---
                                                                const shabbatShiftsSet = new Set([
                                                                    'Friday|Evening',
                                                                    'Friday|Night',
                                                                    'Saturday|Morning',
                                                                    'Saturday|Noon',
                                                                    'Saturday|Evening',
                                                                ]);
                                                                const isShabbatShift =
                                                                    shabbatShiftsSet.has(`${myDay}|${myShift}`) ||
                                                                    shabbatShiftsSet.has(`${theirDay}|${theirShift}`);
                                                                const isNightShift =
                                                                    (myShift === 'Night' || theirShift === 'Night') && !isShabbatShift;
                                                                const isRegularShift =
                                                                    !isShabbatShift &&
                                                                    myShift !== 'Night' &&
                                                                    theirShift !== 'Night';

                                                                if (isShabbatShift || isNightShift || isRegularShift) {
                                                                    const now = new Date();
                                                                    const year = now.getFullYear();
                                                                    const month = now.getMonth() + 1;

                                                                    const meStats = calculateShiftStats(updated, me);
                                                                    const themStats = calculateShiftStats(updated, them);

                                                                    await saveWeeklyStats(currentCompany, year, month, weekKey, me, meStats);
                                                                    await saveWeeklyStats(
                                                                        currentCompany,
                                                                        year,
                                                                        month,
                                                                        weekKey,
                                                                        them,
                                                                        themStats
                                                                    );
                                                                }

                                                                toast.success('Swap approved and shifts updated.');
                                                                setShiftOfferParams(null);

                                                                await sendNotification(
                                                                    currentCompany,
                                                                    me,
                                                                    `The admin approved your shift swap. You are now assigned to the ${theirShift} shift on ${theirDay}.`,
                                                                    `/schedule?weekOffset=${weekOffset}`
                                                                );

                                                                await sendNotification(
                                                                    currentCompany,
                                                                    them,
                                                                    `The admin approved your shift swap. You are now assigned to the ${myShift} shift on ${myDay}.`,
                                                                    `/schedule?weekOffset=${weekOffset}`
                                                                );
                                                            }}
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            className="submit-swap-button"
                                                            style={{ backgroundColor: '#e74c3c' }}
                                                            onClick={() => {
                                                                setShiftOfferParams(null);
                                                                toast.info('Swap request declined.');
                                                            }}
                                                        >
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    ) : (
                                        <p className="no-schedule-message">
                                            No published schedule is available for this week.
                                        </p>
                                    )
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}

export default ScheduleScreen;