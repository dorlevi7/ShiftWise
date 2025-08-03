// React core hooks
import React, { useState, useEffect } from 'react';

// Navigation hook from React Router
import { useNavigate } from 'react-router-dom';

// Toast notification and modal libraries
import { toast, ToastContainer } from 'react-toastify';
import Select from 'react-select';
import Modal from 'react-modal';

// Import external styles
import 'react-toastify/dist/ReactToastify.css';
import '../styles/AvailabilityScreen.css';
import '../styles/Navbar.css';

// Services for handling availability, users, and notifications
import { saveAvailability, getAvailability, saveNecessaryEmployees, getNecessaryEmployees, fetchEditStatus } from '../services/availabilityService';
import { getUsers } from '../services/userService';
import { sendNotification } from '../services/notificationService';
import { saveVacationRequest } from '../services/availabilityService';

// Utility functions
import { formatDate } from '../utils/utils';
import { getWeekDateObjects, calculateWeekKey, calculateWeekRange } from '../utils/utils';

// UUID generator
import { v4 as uuidv4 } from 'uuid';

// Internal components
import Navbar from './Navbar';
import Loader from './Common/Loader';
import BackgroundWrapper from './Layouts/BackgroundWrapper';
import VacationRequestModal from '../components/Modals/VacationRequestModal';

// Set root element for modal accessibility
Modal.setAppElement('#root');

const AvailabilityScreen = () => {

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const shifts = ['Morning', 'Noon', 'Evening', 'Night'];
    const [employees, setEmployees] = useState([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [availability, setAvailability] = useState(null);
    const [notes, setNotes] = useState('');
    const [currentWeek, setCurrentWeek] = useState(1);
    const [userData, setUserData] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [isEditAllowed, setIsEditAllowed] = useState(true);
    const [vacationModalOpen, setVacationModalOpen] = useState(false);
    const [vacationStartDate, setVacationStartDate] = useState(null);
    const [vacationEndDate, setVacationEndDate] = useState(null);
    const navigate = useNavigate();
    const [weekDays, setWeekDays] = useState([]);
    const [textDirection, setTextDirection] = useState('rtl');

    // Scroll to top of the page on component mount
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Fetch edit permission status for the current week based on the logged-in user's company
    useEffect(() => {
        const fetchEditStatusForWeek = async () => {

            // If user data is not available, do nothing
            if (!userData) return;

            const companyId = userData.company.id;
            const weekKey = calculateWeekKey(currentWeek);

            try {
                // Retrieve edit status for the selected week
                const status = await fetchEditStatus(companyId, weekKey);
                // Set edit permission based on fetched status (default to false if not available)
                setIsEditAllowed(status?.isEditAllowed ?? false);
            } catch (error) {
                // Log error and prevent editing
                console.error('Failed to fetch edit status:', error);
                setIsEditAllowed(false);
            }
        };

        fetchEditStatusForWeek();
    }, [userData, currentWeek]); // Re-run effect when user data or selected week changes

    // On component mount: check if user is logged in and fetch relevant user/employee data
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        // Redirect to login if user not found in local storage
        if (!loggedUser) {
            navigate('/');
        } else {
            // Set user data from local storage
            setUserData(loggedUser);

            // If user is an admin, fetch all employees in their company
            if (loggedUser.user.role === 'admin') {
                const fetchEmployees = async () => {
                    try {
                        const usersData = await getUsers();
                        const companyId = loggedUser.company.id;

                        if (companyId) {
                            // Filter users to include only those from the same company
                            const filteredEmployees = Object.entries(usersData)
                                .map(([id, user]) => ({ id, ...user }))
                                .filter((user) =>
                                    user.companyIds?.some((company) => company.companyId === companyId)
                                );

                            setEmployees(filteredEmployees);
                        }
                    } catch (error) {
                        console.error('Error fetching employees:', error);
                    }
                };

                fetchEmployees();
            } else {
                setUserData(loggedUser);

                if (loggedUser.user.role === 'admin') {
                } else {
                    // For regular employees: set their own ID and fetch only their data
                    setSelectedEmployeeId(loggedUser.user.id);

                    const fetchCurrentUserData = async () => {
                        try {
                            const usersData = await getUsers();
                            const userFromDB = usersData[loggedUser.user.id];

                            // If user exists in DB, set it as the only employee in list
                            if (userFromDB) {
                                setEmployees([{ id: loggedUser.user.id, ...userFromDB }]);
                            }
                        } catch (error) {
                            console.error("Error fetching current user data:", error);
                        }
                    };

                    fetchCurrentUserData();
                }
            }
        }
    }, [navigate]);

    // Fetch availability data for selected employee and current week
    useEffect(() => {
        const fetchAvailability = async () => {
            // Do nothing if required data is missing
            if (!selectedEmployeeId || !userData) return;

            const companyId = userData.company.id;
            const weekKey = calculateWeekKey(currentWeek);

            try {
                // Get availability data for the selected employee and week
                const fetchedAvailability = await getAvailability(companyId, weekKey, selectedEmployeeId);
                // Initialize availability state with default or fetched values
                setAvailability(initializeAvailability(fetchedAvailability || {}));
                // Set notes if available
                setNotes(fetchedAvailability?.notes || '');
            } catch (error) {
                console.error('Error fetching availability:', error);
                alert('Failed to fetch availability. Please try again.');
            }
        };

        fetchAvailability();
    }, [currentWeek, selectedEmployeeId, userData]);

    // Update week and weekdays whenever weekOffset changes
    useEffect(() => {
        const newWeek = weekOffset + 1;
        setCurrentWeek(newWeek);
        setWeekDays(getWeekDateObjects(newWeek));
    }, [weekOffset]);

    // Initialize availability data structure using existing data or defaults
    const initializeAvailability = (existingAvailability) => {
        return shifts.reduce((acc, shift) => {
            acc[shift] = daysOfWeek.reduce((dayAcc, day) => {
                dayAcc[day] = {
                    isAvailable: existingAvailability[shift]?.[day]?.isAvailable || false,
                    status: existingAvailability[shift]?.[day]?.status || 'default'
                };
                return dayAcc;
            }, {});
            return acc;
        }, {});
    };

    // Toggle availability for a specific shift and day
    const handleAvailabilityChange = (shift, day) => {
        setAvailability((prev) => ({
            ...prev,
            [shift]: {
                ...prev[shift],
                [day]: {
                    ...prev[shift][day],
                    isAvailable: !prev[shift][day].isAvailable,
                },
            },
        }));
    };

    // Toggle availability for all shifts in a specific day column
    const handleDayColumnClick = (day) => {
        setAvailability((prev) => {
            const updatedAvailability = JSON.parse(JSON.stringify(prev));
            const allSelected = shifts.every((shift) => updatedAvailability[shift]?.[day]?.isAvailable);

            shifts.forEach((shift) => {
                updatedAvailability[shift][day].isAvailable = !allSelected;
            });

            return updatedAvailability;
        });
    };

    // Toggle availability for all days in a specific shift row
    const handleShiftRowClick = (shift) => {
        setAvailability((prev) => {
            const updatedAvailability = JSON.parse(JSON.stringify(prev));
            const allSelected = daysOfWeek.every((day) => updatedAvailability[shift]?.[day]?.isAvailable);

            daysOfWeek.forEach((day) => {
                updatedAvailability[shift][day].isAvailable = !allSelected;
            });

            return updatedAvailability;
        });
    };

    // Toggle all availability cells in the table (select or deselect all)
    const handleSelectAll = () => {
        setAvailability((prev) => {
            const updatedAvailability = JSON.parse(JSON.stringify(prev));
            const allSelected = shifts.every((shift) =>
                daysOfWeek.every((day) => updatedAvailability[shift][day].isAvailable)
            );

            shifts.forEach((shift) => {
                daysOfWeek.forEach((day) => {
                    updatedAvailability[shift][day].isAvailable = !allSelected;
                });
            });

            return updatedAvailability;
        });
    };

    // Submit the availability data to the database
    const handleSubmit = async () => {
        // Validate selected employee
        if (!selectedEmployeeId) {
            toast.error('Please select an employee to save availability.');
            return;
        }

        const companyId = userData.company.id;
        const weekKey = calculateWeekKey(currentWeek);

        try {
            // Check if editing is allowed for this week
            const editStatus = await fetchEditStatus(companyId, weekKey);
            if (!editStatus?.isEditAllowed) {
                toast.error('Editing availability is currently locked for this week.');
                return;
            }

            // Prepare data and save to database
            const dataToSave = {
                ...availability,
                notes,
            };
            await saveAvailability(companyId, weekKey, selectedEmployeeId, dataToSave);

            // Ensure necessaryEmployees exists for the week, otherwise initialize it
            let necessaryEmployees = await getNecessaryEmployees(companyId, weekKey);

            if (!necessaryEmployees || Object.keys(necessaryEmployees).length === 0) {
                necessaryEmployees = daysOfWeek.reduce((acc, day) => {
                    acc[day] = {
                        Morning: 0,
                        Noon: 0,
                        Evening: 0,
                        Night: 0,
                    };
                    return acc;
                }, {});

                await saveNecessaryEmployees(companyId, weekKey, necessaryEmployees);
            }

            toast.success('Availability and notes saved successfully!');
        } catch (error) {
            console.error('Error saving availability or necessary employees:', error);
            toast.error('Failed to save data. Please try again.');
        }
    };

    // Handle vacation request submission
    const handleVacationRequestSubmit = async (e) => {
        e.preventDefault();

        // Validate selected dates
        if (!vacationStartDate || !vacationEndDate) {
            toast.error('Please select valid dates');
            return;
        }

        try {
            const companyId = userData.company.id;
            const userId = selectedEmployeeId;
            const requestId = uuidv4();

            // Find the employee name for the request
            const employee = employees.find((e) => e.id === userId);
            const employeeName = employee?.name || 'Unknown';

            // Save the vacation request to the database
            await saveVacationRequest(companyId, userId, requestId, {
                startDate: vacationStartDate.toISOString(),
                endDate: vacationEndDate.toISOString(),
                status: 'pending',
                requestedBy: {
                    id: userId,
                    name: employeeName,
                },
            });

            // Find the admin of the company to notify
            const allUsers = await getUsers();
            const companyAdmin = Object.entries(allUsers).find(
                ([, user]) =>
                    user.role === 'admin' &&
                    user.companyIds?.some(c => c.companyId === companyId)
            );

            // Send notification to the admin if found
            if (companyAdmin) {
                const adminId = companyAdmin[0];
                await sendNotification(
                    companyId,
                    adminId,
                    `${employeeName} requested vacation from ${formatDate(vacationStartDate)} to ${formatDate(vacationEndDate)}. Please approve or decline the request.`,
                    '/admin/vacation-requests',
                    {
                        vacationUserId: userId,
                        vacationRequestId: requestId
                    }
                );
            }

            toast.success('Vacation request sent successfully');
            setVacationModalOpen(false);
            setVacationStartDate(null);
            setVacationEndDate(null);
        } catch (error) {
            console.error('Vacation request error:', error);
            toast.error('Error submitting vacation request');
        }
    };

    // Change the current viewed week
    const handleWeekChange = (direction) => {
        setWeekOffset((prevOffset) => prevOffset + direction);
    };

    // Show loader while user data is loading
    if (!userData) {
        return <Loader />;
    }

    // Sort employees alphabetically by name (Hebrew-friendly)
    const sortedEmployees = [...employees].sort((a, b) =>
        a.name.localeCompare(b.name, 'he', { sensitivity: 'base' })
    );

    return (
        <BackgroundWrapper>
            <div>
                <Navbar />
                <div className="navbar-placeholder"></div>
                <div className="availability-wrapper">

                    <div className="availability-container">

                        <div className="availability-header">
                            <h1>Weekly Availability</h1>
                            <img
                                src="/images/ShiftWise_Owl_Availability.png"
                                alt="ShiftWise Owl"
                                className="availability-logo"
                            />
                        </div>

                        {userData.user.role === 'admin' && (
                            <div className="employee-selector">
                                <div className="dropdown-container">
                                    <label htmlFor="employeeDropdown">Select Employee:</label>
                                    <Select
                                        className="employee-dropdown"
                                        classNamePrefix="react-select"
                                        options={sortedEmployees.map((e) => ({ value: e.id, label: e.name }))}
                                        onChange={(option) => setSelectedEmployeeId(option?.value || '')}
                                        placeholder="Select an employee"
                                        menuPlacement="bottom"
                                        value={
                                            sortedEmployees
                                                .map((e) => ({ value: e.id, label: e.name }))
                                                .find((o) => o.value === selectedEmployeeId) || null
                                        }
                                    />
                                </div>

                                {selectedEmployeeId && (() => {
                                    const selected = employees.find(emp => emp.id === selectedEmployeeId);
                                    return (
                                        <img
                                            src={selected?.photoData || '/images/Profile.jpeg'}
                                            alt={`${selected?.name || 'Employee'}'s profile`}
                                            className="employee-photo-preview"
                                        />
                                    );
                                })()}
                            </div>
                        )}

                        {userData.user.role !== 'admin' && (
                            <div className="employee-selector">
                                <div className="employee-photo-wrapper">
                                    {(() => {
                                        const currentUser = employees.find(emp => emp.id === selectedEmployeeId);
                                        return (
                                            <img
                                                src={currentUser?.photoData || '/images/Profile.jpeg'}
                                                alt={`${currentUser?.name || 'Your'} profile`}
                                                className="employee-photo-preview"
                                            />
                                        );
                                    })()}
                                </div>
                            </div>
                        )}

                        {selectedEmployeeId && (
                            <>
                                <div className="week-navigation">
                                    <button className="navigation-button" onClick={() => handleWeekChange(-1)}>
                                        Previous Week
                                    </button>
                                    <h2 className="week-range">{calculateWeekRange(currentWeek)}</h2>
                                    <button className="navigation-button" onClick={() => handleWeekChange(1)}>
                                        Next Week
                                    </button>
                                </div>
                                <table className="availability-table">
                                    <thead>
                                        <tr>
                                            <th onClick={handleSelectAll} className="clickable">Select All</th>
                                            {weekDays.map(({ name, date }) => (
                                                <th key={name} onClick={() => handleDayColumnClick(name)} className="clickable">
                                                    {name}
                                                    <br />
                                                    <span style={{ fontSize: '0.85em', color: '#555' }}>{date}</span>
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {shifts.map((shift) => (
                                            <tr key={shift}>
                                                <td onClick={() => handleShiftRowClick(shift)} className="clickable">
                                                    {shift}
                                                </td>
                                                {weekDays.map(({ name }) => (
                                                    <td key={name}>
                                                        <input
                                                            type="checkbox"
                                                            checked={availability?.[shift]?.[name]?.isAvailable || false}
                                                            onChange={() => handleAvailabilityChange(shift, name)}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                                <div className="direction-toggle">
                                    <label htmlFor="textDirection">Text direction:</label>
                                    <Select
                                        id="textDirection"
                                        className="employee-dropdown"
                                        classNamePrefix="react-select"
                                        options={[
                                            { value: 'rtl', label: 'RTL (Hebrew)' },
                                            { value: 'ltr', label: 'LTR (English)' },
                                        ]}
                                        value={
                                            [{ value: 'rtl', label: 'RTL (Hebrew)' }, { value: 'ltr', label: 'LTR (English)' }]
                                                .find(option => option.value === textDirection)
                                        }
                                        onChange={(selectedOption) => setTextDirection(selectedOption.value)}
                                        placeholder="Select direction"
                                        menuPlacement="bottom"
                                    />
                                </div>

                                <textarea
                                    className="notes-textarea"
                                    placeholder={textDirection === 'rtl' ? 'כתוב כאן את ההערות השבועיות...' : 'Write weekly notes here...'}
                                    dir={textDirection}
                                    style={{ textAlign: textDirection === 'rtl' ? 'right' : 'left' }}
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                ></textarea>

                                <p style={{ textAlign: 'center', color: isEditAllowed ? 'green' : 'red', fontWeight: 'bold' }}>
                                    {isEditAllowed ? 'Availability editing is currently open.' : 'Availability editing is currently locked.'}
                                </p>

                                <button className="submit-button" onClick={handleSubmit}>
                                    Submit
                                </button>
                                <button
                                    className="submit-button"
                                    style={{ marginTop: '10px' }}
                                    onClick={() => setVacationModalOpen(true)}
                                >
                                    Request Vacation
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <ToastContainer />
                <VacationRequestModal
                    isOpen={vacationModalOpen}
                    onClose={() => setVacationModalOpen(false)}
                    vacationStartDate={vacationStartDate}
                    vacationEndDate={vacationEndDate}
                    setVacationStartDate={setVacationStartDate}
                    setVacationEndDate={setVacationEndDate}
                    handleVacationRequestSubmit={handleVacationRequestSubmit}
                />

            </div>
        </BackgroundWrapper>
    );
};

export default AvailabilityScreen;