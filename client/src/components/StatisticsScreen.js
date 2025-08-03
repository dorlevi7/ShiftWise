// React hooks for managing state and side effects
import React, { useState, useEffect } from 'react';
// Hook for navigation between routes
import { useNavigate } from 'react-router-dom';

// Toast notifications for user feedback
import { toast, ToastContainer } from 'react-toastify';
// Dropdown component for selecting users
import Select from 'react-select';
// Styles for toast notifications
import 'react-toastify/dist/ReactToastify.css';

// Navigation bar component
import Navbar from './Navbar';
// Background layout wrapper
import BackgroundWrapper from './Layouts/BackgroundWrapper';
// CSS styles specific to the statistics screen
import '../styles/StatisticsScreen.css';

// Service function to fetch users
import { getUsers } from '../services/userService';
// Service function to fetch weekly shift statistics
import { getWeeklyStats } from '../services/statsService';

// Utility functions for week calculations
import { calculateWeekKey, calculateWeekRange } from '../utils/utils';

// Chart components from Recharts library
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';

const StatisticsScreen = () => {
    const [userData, setUserData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [mode, setMode] = useState('single'); // 'single' or 'compare'
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    const [secondEmployeeId, setSecondEmployeeId] = useState(null);
    const [stats, setStats] = useState(null);
    const [secondStats, setSecondStats] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [weeksRange, setWeeksRange] = useState(1);
    const navigate = useNavigate();
    const [allStats, setAllStats] = useState([]);
    const [sortKey, setSortKey] = useState('name');
    const [sortDirection, setSortDirection] = useState('asc');
    const [showCharts, setShowCharts] = useState(false);

    // Scroll to top when the component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Load logged user and fetch employees from the same company
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedUser) {
            navigate('/');
        } else {
            setUserData(loggedUser);

            // Fetch all users and filter by current company
            const fetchEmployees = async () => {

                try {
                    const usersData = await getUsers();
                    const companyId = loggedUser.company.id;
                    const filteredEmployees = Object.entries(usersData)
                        .map(([id, user]) => ({ id, ...user }))
                        .filter((user) => user.companyIds?.some((c) => c.companyId === companyId));
                    setEmployees(filteredEmployees);
                } catch (error) {
                    console.error('Error fetching employees:', error);
                }
            };
            fetchEmployees();
        }
    }, [navigate]);

    // Fetch and calculate weekly statistics for employees (based on selected mode)
    useEffect(() => {
        const fetchStats = async (employeeId, setter) => {
            try {
                const companyId = userData.company.id;
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth() + 1;

                let totalNight = 0;
                let totalShabbat = 0;
                let totalRegular = 0;

                // Aggregate stats over the selected weeks
                for (let offset = weekOffset; offset > weekOffset - weeksRange; offset--) {
                    const weekKey = calculateWeekKey(offset);
                    const data = await getWeeklyStats(companyId, year, month, weekKey, employeeId);

                    if (data) {
                        totalNight += data.nightShifts || 0;
                        totalShabbat += data.shabbatShifts || 0;
                        totalRegular += data.regularShifts || 0;
                    }
                }

                const totalAllShifts = totalNight + totalShabbat + totalRegular;

                // Set the aggregated and average statistics
                setter({
                    nightShifts: totalNight,
                    shabbatShifts: totalShabbat,
                    regularShifts: totalRegular,
                    avgNight: totalNight / weeksRange,
                    avgShabbat: totalShabbat / weeksRange,
                    avgRegular: totalRegular / weeksRange,
                    totalAll: totalAllShifts,
                    avgAll: totalAllShifts / weeksRange
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
                toast.error('Failed to fetch statistics');
            }
        };

        if (!userData) return;

        // Fetch stats for a single employee
        if (mode === 'single' && selectedEmployeeId) {
            fetchStats(selectedEmployeeId, setStats);
            // Fetch stats for comparison between two employees
        } else if (mode === 'compare' && selectedEmployeeId && secondEmployeeId) {
            fetchStats(selectedEmployeeId, setStats);
            fetchStats(secondEmployeeId, setSecondStats);
            // Fetch stats for all employees to display in a table
        } else if (mode === 'table' && employees.length > 0) {
            const fetchAllStats = async () => {
                try {
                    const companyId = userData.company.id;
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = now.getMonth() + 1;

                    const results = await Promise.all(
                        employees.map(async (employee) => {
                            let totalNight = 0;
                            let totalShabbat = 0;
                            let totalRegular = 0;

                            // Aggregate stats per employee over the selected weeks
                            for (let offset = weekOffset; offset > weekOffset - weeksRange; offset--) {
                                const weekKey = calculateWeekKey(offset);
                                const data = await getWeeklyStats(companyId, year, month, weekKey, employee.id);

                                if (data) {
                                    totalNight += data.nightShifts || 0;
                                    totalShabbat += data.shabbatShifts || 0;
                                    totalRegular += data.regularShifts || 0;
                                }
                            }

                            const totalAll = totalNight + totalShabbat + totalRegular;

                            // Return the aggregated stats object
                            return {
                                id: employee.id,
                                name: employee.name,
                                night: totalNight,
                                shabbat: totalShabbat,
                                regular: totalRegular,
                                total: totalAll,
                                avgNight: totalAll === 0 ? '0%' : `${((totalNight / totalAll) * 100).toFixed(1)}%`,
                                avgShabbat: totalAll === 0 ? '0%' : `${((totalShabbat / totalAll) * 100).toFixed(1)}%`,
                                avgRegular: totalAll === 0 ? '0%' : `${((totalRegular / totalAll) * 100).toFixed(1)}%`,
                                avgTotal: (totalAll / weeksRange).toFixed(2)
                            };
                        })
                    );

                    setAllStats(results);
                } catch (error) {
                    console.error('Error fetching all employees stats:', error);
                    toast.error('Failed to fetch all statistics');
                }
            };

            fetchAllStats();
        }
    }, [userData, selectedEmployeeId, secondEmployeeId, weekOffset, weeksRange, mode, employees]);

    // Get the name of an employee by ID
    const getEmployeeNameById = (id) => {
        const employee = employees.find(e => e.id === id);
        return employee ? employee.name : 'Employee';
    };

    // Update week offset for navigation
    const handleWeekChange = (direction) => {
        setWeekOffset((prev) => prev + direction);
    };

    // Sort employees alphabetically by name (Hebrew locale)
    const sortedEmployees = [...employees].sort((a, b) => a.name.localeCompare(b.name, 'he'));

    // Sort statistics table based on selected column and direction
    const sortedStats = [...allStats].sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];

        // Parse string percentages or return numeric/text values
        const parseValue = (val) => {
            if (typeof val === 'string' && val.includes('%')) {
                return parseFloat(val.replace('%', ''));
            }
            return isNaN(val) ? String(val) : val;
        };

        const parsedA = parseValue(valA);
        const parsedB = parseValue(valB);

        // Perform numeric or string-based comparison
        if (typeof parsedA === 'number' && typeof parsedB === 'number') {
            return sortDirection === 'asc' ? parsedA - parsedB : parsedB - parsedA;
        } else {
            return sortDirection === 'asc'
                ? String(parsedA).localeCompare(parsedB, 'he')
                : String(parsedB).localeCompare(parsedA, 'he');
        }
    });

    return (
        <BackgroundWrapper>
            <div>
                <Navbar />
                <div className="navbar-placeholder"></div>

                <div className="statistics-wrapper">

                    <div className="statistics-container">

                        <div className="statistics-header">
                            <h1>Statistics</h1>
                            <img
                                src="/images/ShiftWise_Owl_Statistics.png"
                                alt="ShiftWise Owl"
                                className="statistics-logo"
                            />
                        </div>

                        <div className="week-navigation centered-navigation">
                            <button className="navigation-button" onClick={() => handleWeekChange(-1)}>
                                Previous Week
                            </button>
                            <h2 className="week-range">
                                {weeksRange === 1
                                    ? `Week: ${calculateWeekRange(weekOffset)}`
                                    : `Weeks: ${calculateWeekRange(weekOffset - weeksRange + 1)} To ${calculateWeekRange(weekOffset)}`}
                            </h2>
                            <button className="navigation-button" onClick={() => handleWeekChange(1)}>
                                Next Week
                            </button>
                        </div>

                        <div className="weeks-range-selector">
                            <label htmlFor="weeksRange">Number of weeks to include:</label>
                            <input
                                type="number"
                                id="weeksRange"
                                min="1"
                                value={weeksRange}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value) && value > 0) {
                                        setWeeksRange(value);
                                    }
                                }}
                            />
                        </div>

                        <div className="mode-toggle">
                            <label>
                                <input
                                    type="radio"
                                    value="single"
                                    checked={mode === 'single'}
                                    onChange={() => setMode('single')}
                                /> Single
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="compare"
                                    checked={mode === 'compare'}
                                    onChange={() => setMode('compare')}
                                /> Compare
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="table"
                                    checked={mode === 'table'}
                                    onChange={() => setMode('table')}
                                /> Table
                            </label>
                        </div>

                        <div className="stats-box">
                            {mode === 'compare' ? (
                                <div>
                                    <div className="comparison-container">
                                        <div className="employee-comparison-box">
                                            <div className="employee-selector">
                                                <label>Select First Employee:</label>
                                                <Select
                                                    className="employee-dropdown"
                                                    classNamePrefix="react-select"
                                                    options={sortedEmployees.map(e => ({ value: e.id, label: e.name }))}
                                                    onChange={(option) => setSelectedEmployeeId(option?.value || '')}
                                                    value={sortedEmployees.map(e => ({ value: e.id, label: e.name })).find(o => o.value === selectedEmployeeId) || null}
                                                    placeholder="Choose employee"
                                                />
                                            </div>
                                            {stats && (
                                                <div className="statistics-summary">
                                                    <p><strong>Total Night Shifts:</strong> {stats.nightShifts}</p>
                                                    <p><strong>Total Shabbat Shifts:</strong> {stats.shabbatShifts}</p>
                                                    <p><strong>Total Regular Shifts:</strong> {stats.regularShifts}</p>
                                                    <p><strong>Total All Shifts:</strong> {stats.totalAll}</p>
                                                    <hr />
                                                    <p><strong>Average per Week:</strong></p>
                                                    <p>Night: {stats.avgNight.toFixed(2)} ({((stats.nightShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Shabbat: {stats.avgShabbat.toFixed(2)} ({((stats.shabbatShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Regular: {stats.avgRegular.toFixed(2)} ({((stats.regularShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>All Shifts: {stats.avgAll.toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="vertical-divider"></div>

                                        <div className="employee-comparison-box">
                                            <div className="employee-selector">
                                                <label>Select Second Employee:</label>
                                                <Select
                                                    className="employee-dropdown"
                                                    classNamePrefix="react-select"
                                                    options={sortedEmployees.map(e => ({ value: e.id, label: e.name }))}
                                                    onChange={(option) => setSecondEmployeeId(option?.value || '')}
                                                    value={sortedEmployees.map(e => ({ value: e.id, label: e.name })).find(o => o.value === secondEmployeeId) || null}
                                                    placeholder="Choose employee"
                                                />
                                            </div>
                                            {secondStats && (
                                                <div className="statistics-summary">
                                                    <p><strong>Total Night Shifts:</strong> {secondStats.nightShifts}</p>
                                                    <p><strong>Total Shabbat Shifts:</strong> {secondStats.shabbatShifts}</p>
                                                    <p><strong>Total Regular Shifts:</strong> {secondStats.regularShifts}</p>
                                                    <p><strong>Total All Shifts:</strong> {secondStats.totalAll}</p>
                                                    <hr />
                                                    <p><strong>Average per Week:</strong></p>
                                                    <p>Night: {secondStats.avgNight.toFixed(2)} ({((secondStats.nightShifts / secondStats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Shabbat: {secondStats.avgShabbat.toFixed(2)} ({((secondStats.shabbatShifts / secondStats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Regular: {secondStats.avgRegular.toFixed(2)} ({((secondStats.regularShifts / secondStats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>All Shifts: {secondStats.avgAll.toFixed(2)}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    {stats && secondStats && (
                                        <div className="chart-toggle-container">
                                            <button
                                                className="show-chart-button"
                                                onClick={() => setShowCharts(!showCharts)}
                                            >
                                                {showCharts ? 'Hide Chart' : 'Show Chart'}
                                            </button>

                                            {showCharts && (
                                                <div className="statistics-comparison-chart">
                                                    <BarChart width={500} height={300} data={[
                                                        {
                                                            name: 'Night',
                                                            [getEmployeeNameById(selectedEmployeeId)]: stats.nightShifts,
                                                            [getEmployeeNameById(secondEmployeeId)]: secondStats.nightShifts
                                                        },
                                                        {
                                                            name: 'Shabbat',
                                                            [getEmployeeNameById(selectedEmployeeId)]: stats.shabbatShifts,
                                                            [getEmployeeNameById(secondEmployeeId)]: secondStats.shabbatShifts
                                                        },
                                                        {
                                                            name: 'Regular',
                                                            [getEmployeeNameById(selectedEmployeeId)]: stats.regularShifts,
                                                            [getEmployeeNameById(secondEmployeeId)]: secondStats.regularShifts
                                                        }
                                                    ]}>
                                                        <XAxis dataKey="name" />
                                                        <YAxis allowDecimals={false} />
                                                        <Tooltip />
                                                        <Legend />
                                                        <Bar dataKey={getEmployeeNameById(secondEmployeeId)} fill="#e67e22" />
                                                        <Bar dataKey={getEmployeeNameById(selectedEmployeeId)} fill="#3498db" />
                                                    </BarChart>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                </div>

                            ) : mode === 'table' ? (
                                <div className="table-container">
                                    <table className="statistics-table">
                                        <thead>
                                            <tr>
                                                {[
                                                    { key: 'name', label: 'Name' },
                                                    { key: 'night', label: 'Night' },
                                                    { key: 'shabbat', label: 'Shabbat' },
                                                    { key: 'regular', label: 'Regular' },
                                                    { key: 'total', label: 'Total' },
                                                    { key: 'avgNight', label: 'Avg Night' },
                                                    { key: 'avgShabbat', label: 'Avg Shabbat' },
                                                    { key: 'avgRegular', label: 'Avg Regular' },
                                                    { key: 'avgTotal', label: 'Avg Total' },
                                                ].map(({ key, label }) => (
                                                    <th
                                                        key={key}
                                                        onClick={() => {
                                                            if (sortKey === key) {
                                                                setSortDirection(sortDirection === 'desc' ? 'asc' : 'desc');
                                                            } else {
                                                                setSortKey(key);
                                                                setSortDirection('desc');
                                                            }
                                                        }}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        {label} {sortKey === key && (sortDirection === 'asc' ? '🔼' : '🔽')}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {sortedStats.map((stat) => (
                                                <tr key={stat.id}>
                                                    <td>{stat.name}</td>
                                                    <td>{stat.night}</td>
                                                    <td>{stat.shabbat}</td>
                                                    <td>{stat.regular}</td>
                                                    <td>{stat.total}</td>
                                                    <td>{stat.avgNight}</td>
                                                    <td>{stat.avgShabbat}</td>
                                                    <td>{stat.avgRegular}</td>
                                                    <td>{stat.avgTotal}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="single-container">
                                    <div className="employee-comparison-box">
                                        <div className="employee-selector">
                                            <label>Select Employee:</label>
                                            <Select
                                                className="employee-dropdown"
                                                classNamePrefix="react-select"
                                                options={sortedEmployees.map(e => ({ value: e.id, label: e.name }))}
                                                onChange={(option) => setSelectedEmployeeId(option?.value || '')}
                                                value={sortedEmployees.map(e => ({ value: e.id, label: e.name })).find(o => o.value === selectedEmployeeId) || null}
                                                placeholder="Choose employee"
                                            />
                                        </div>
                                        {stats && (
                                            <div className="statistics-summary-wrapper">
                                                <div className="statistics-summary">
                                                    <p><strong>Total Night Shifts:</strong> {stats.nightShifts}</p>
                                                    <p><strong>Total Shabbat Shifts:</strong> {stats.shabbatShifts}</p>
                                                    <p><strong>Total Regular Shifts:</strong> {stats.regularShifts}</p>
                                                    <p><strong>Total All Shifts:</strong> {stats.totalAll}</p>
                                                    <hr />
                                                    <p><strong>Average per Week:</strong></p>
                                                    <p>Night: {stats.avgNight.toFixed(2)} ({((stats.nightShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Shabbat: {stats.avgShabbat.toFixed(2)} ({((stats.shabbatShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>Regular: {stats.avgRegular.toFixed(2)} ({((stats.regularShifts / stats.totalAll) * 100).toFixed(1)}%)</p>
                                                    <p>All Shifts: {stats.avgAll.toFixed(2)}</p>
                                                </div>

                                                <div className="chart-toggle-container">
                                                    <button
                                                        className="show-chart-button"
                                                        onClick={() => setShowCharts(!showCharts)}
                                                    >
                                                        {showCharts ? 'Hide Chart' : 'Show Chart'}
                                                    </button>

                                                    {showCharts && (
                                                        <div className="statistics-chart">
                                                            <BarChart width={400} height={300} data={[
                                                                { name: 'Night', value: stats.nightShifts },
                                                                { name: 'Shabbat', value: stats.shabbatShifts },
                                                                { name: 'Regular', value: stats.regularShifts }
                                                            ]}>
                                                                <XAxis dataKey="name" />
                                                                <YAxis allowDecimals={false} />
                                                                <Tooltip />
                                                                <Legend />
                                                                <Bar dataKey="value" fill="#2980b9" />
                                                            </BarChart>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <ToastContainer />
            </div>
        </BackgroundWrapper>
    );
};

export default StatisticsScreen;