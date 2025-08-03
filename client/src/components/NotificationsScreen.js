// React hooks for managing state and lifecycle
import React, { useEffect, useState } from 'react';

// Services for handling notifications and vacation requests
import { sendNotification, getUserNotifications, markAsRead } from '../services/notificationService';
import { getVacationRequest, updateVacationStatus } from '../services/availabilityService';

// Loader component for showing loading spinner
import Loader from './Common/Loader';
// Wrapper component for background image
import BackgroundWrapper from './Layouts/BackgroundWrapper';
// Navigation bar component
import Navbar from './Navbar';

// Global and component-specific styles
import '../styles/Navbar.css';
import '../styles/NotificationsScreen.css';

// Toast notifications for user feedback
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function NotificationsScreen() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));
    const companyId = user?.company?.id;
    const userId = user?.user?.id;

    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectionInput, setShowRejectionInput] = useState(null);

    // Scroll to top when component mounts
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, []);

    // Fetch user notifications from the database
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const data = await getUserNotifications(companyId, userId);
                // Format notifications into an array and reverse for latest first
                const formatted = data ? Object.entries(data).map(([id, notif]) => ({
                    id,
                    ...notif
                })) : [];
                setNotifications(formatted.reverse());
            } catch (error) {
                console.error('Error loading notifications:', error);
            } finally {
                setLoading(false);
            }
        };

        if (companyId && userId) fetchNotifications();
    }, [companyId, userId]);

    // Mark a single notification as read in the database and update local state
    const handleMarkAsRead = async (notifId) => {
        try {
            await markAsRead(companyId, userId, notifId);
            setNotifications(prev =>
                prev.map(n => n.id === notifId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Mark all unread notifications as read
    const handleMarkAllAsRead = async () => {
        try {
            const unreadNotifs = notifications.filter(n => !n.read);
            await Promise.all(
                unreadNotifs.map(n => markAsRead(companyId, userId, n.id))
            );
            setNotifications(prev =>
                prev.map(n => ({ ...n, read: true }))
            );
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // Show loader while notifications are loading
    if (loading) {
        return <Loader />;
    }

    // Handle admin decision (approve/reject) for a vacation request
    const handleVacationDecision = async (notif, decision) => {
        const { vacationUserId, vacationRequestId } = notif.meta || {};

        // Validate metadata
        if (!vacationUserId || !vacationRequestId) {
            alert('Missing vacation metadata');
            return;
        }

        try {
            // Update vacation request status in database
            await updateVacationStatus(companyId, vacationUserId, vacationRequestId, decision);

            // Fetch vacation request details for the notification message
            const vacationData = await getVacationRequest(companyId, vacationUserId, vacationRequestId);
            const { startDate, endDate } = vacationData;

            // Format date for display
            const formatDate = (dateStr) => {
                const d = new Date(dateStr);
                return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
            };

            // Prepare notification message
            const message = `Your vacation request (${formatDate(startDate)} - ${formatDate(endDate)}) was ${decision}.` +
                (decision === 'rejected' && rejectionReason ? ` \nReason: ${rejectionReason}` : '');

            // Send notification to the employee
            await sendNotification(
                companyId,
                vacationUserId,
                message,
                '',
                { requestId: vacationRequestId, decision }
            );

            toast.success(`Vacation ${decision}`);

            // Update local state to reflect decision
            setNotifications(prev =>
                prev.map(n =>
                    n.id === notif.id
                        ? {
                            ...n,
                            meta: {
                                ...n.meta,
                                vacationDecision: decision,
                                reason: rejectionReason || null
                            }
                        }
                        : n
                )
            );

            // Mark notification as read and reset rejection input
            handleMarkAsRead(notif.id);
            setRejectionReason('');
            setShowRejectionInput(null);
        } catch (error) {
            console.error('Error updating vacation status:', error);
            toast.error('Failed to update vacation status');
        }
    };

    return (
        <BackgroundWrapper >
            <div>
                <Navbar />
                <div className="navbar-placeholder"></div>
                <div className="notifications-wrapper">

                    <div className="notifications-container">
                        <ToastContainer />

                        <div className="notifications-header">
                            <h1>Notifications</h1>
                            <img
                                src="/images/ShiftWise_Owl_Notifications.png"
                                alt="Notifications Owl"
                                className="notifications-logo"
                            />
                        </div>

                        {notifications.length === 0 ? (
                            <p>No notifications yet.</p>
                        ) : (
                            <>
                                <button
                                    className="toggle-form-button"
                                    onClick={handleMarkAllAsRead}
                                >
                                    Mark All as Read
                                </button>


                                <ul>
                                    {notifications.map(notif => (
                                        <li
                                            key={notif.id}
                                            className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                                            onClick={() => handleMarkAsRead(notif.id)}
                                        >
                                            <strong style={{ whiteSpace: 'pre-line' }}>{notif.message}</strong>

                                            {notif.message.includes('requested vacation') &&
                                                user?.user?.role === 'admin' &&
                                                notif?.meta?.vacationDecision !== 'approved' &&
                                                notif?.meta?.vacationDecision !== 'rejected' && (
                                                    <div style={{ marginTop: '10px' }}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleVacationDecision(notif, 'approved');
                                                            }}
                                                            style={{
                                                                marginRight: '10px',
                                                                padding: '5px 10px',
                                                                backgroundColor: '#4CAF50',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Approve
                                                        </button>

                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setShowRejectionInput(notif.id);
                                                            }}
                                                            style={{
                                                                padding: '5px 10px',
                                                                backgroundColor: '#f44336',
                                                                color: 'white',
                                                                border: 'none',
                                                                borderRadius: '5px',
                                                                cursor: 'pointer'
                                                            }}
                                                        >
                                                            Reject
                                                        </button>

                                                        {showRejectionInput === notif.id && (
                                                            <div style={{ marginTop: '10px' }}>
                                                                <input
                                                                    type="text"
                                                                    placeholder="Enter reason for rejection"
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    style={{
                                                                        width: '100%',
                                                                        padding: '5px',
                                                                        marginBottom: '5px'
                                                                    }}
                                                                />
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleVacationDecision(notif, 'rejected');
                                                                    }}
                                                                    style={{
                                                                        padding: '5px 10px',
                                                                        backgroundColor: '#d32f2f',
                                                                        color: 'white',
                                                                        border: 'none',
                                                                        borderRadius: '5px',
                                                                        cursor: 'pointer'
                                                                    }}
                                                                >
                                                                    Confirm Rejection
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                            {notif.linkTo &&
                                                notif.linkTo.trim() !== '' &&
                                                (notif.message.includes('Weekly schedule') || notif.message.includes('shift') || notif.message.includes('swap')) && (
                                                    <div>
                                                        <a href={notif.linkTo}>Go to screen</a>
                                                    </div>
                                                )}

                                            <div style={{ fontSize: '0.8em', color: '#888' }}>
                                                {new Date(notif.timestamp).toLocaleDateString('en-GB')}{' '}
                                                {new Date(notif.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
}

export default NotificationsScreen;
