// React core hooks + router hooks
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// Toast notification library
import { toast } from 'react-toastify';

// External styles
import 'react-toastify/dist/ReactToastify.css';
import '../styles/ChatScreen.css';
import '../styles/Navbar.css';

// Chat-related services (fetch/send messages, last seen)
import { getPrivateLastSeen, markPrivateSeen, getGroupMessages, sendGroupMessage, getPrivateMessages, sendPrivateMessage } from '../services/chatService';

// Service to fetch user data
import { getUsers } from '../services/userService';

// Internal reusable components
import Navbar from './Navbar';
import Loader from './Common/Loader';
import BackgroundWrapper from './Layouts/BackgroundWrapper';

const ChatScreen = () => {

    const navigate = useNavigate();
    const { recipientId } = useParams();
    const [userData, setUserData] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const [companyUsers, setCompanyUsers] = useState([]);
    const [unreadStatus, setUnreadStatus] = useState({});
    const [lastMessageMap, setLastMessageMap] = useState({});

    // Redirect to login if no user found in localStorage
    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('user'));
        if (!loggedUser) {
            navigate('/');
        } else {
            setUserData(loggedUser);
        }
    }, [navigate]);

    // Fetch messages when user data or recipient changes
    useEffect(() => {
        if (userData?.company?.id) {
            fetchMessages();
        }
    }, [userData, recipientId]);

    // Fetch list of company users on user load
    useEffect(() => {
        if (userData?.company?.id) {
            fetchCompanyUsers();
        }
    }, [userData]);

    // Scroll chat to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Check for unread messages once company users are available
    useEffect(() => {
        if (userData?.company?.id && companyUsers.length > 0) {
            checkUnreadMessages(companyUsers);
        }
    }, [userData, companyUsers]);

    // Check unread messages for each user in the list
    const checkUnreadMessages = async (usersList) => {
        const companyId = userData.company.id;
        const currentUserId = userData.user.id;
        const statusMap = {}; // Tracks whether there's an unread message per user
        const timeMap = {}; // Stores the timestamp of the last message per user

        for (const user of usersList) {
            try {
                // Fetch chat messages between current user and each user
                const chatData = await getPrivateMessages(companyId, currentUserId, user.id);
                const messages = chatData
                    ? Object.values(chatData).sort((a, b) => b.timestamp - a.timestamp)
                    : [];

                const lastMessage = messages[0];

                // If there are no messages, mark as no unread and time = 0
                if (!lastMessage) {
                    statusMap[user.id] = false;
                    timeMap[user.id] = 0;
                    continue;
                }

                // Fetch last seen timestamp for current user in this conversation
                const lastSeen = await getPrivateLastSeen(companyId, currentUserId, user.id, currentUserId);
                // Determine if the last message is unread
                const isUnread = (
                    lastMessage.senderId !== currentUserId &&
                    (!lastSeen || lastMessage.timestamp > lastSeen)
                );

                statusMap[user.id] = isUnread;
                timeMap[user.id] = lastMessage.timestamp;
            } catch (err) {
                // On error, assume no unread messages
                console.error('Error checking unread status for', user.name, err);
                statusMap[user.id] = false;
                timeMap[user.id] = 0;
            }
        }

        // Update component state with unread statuses and timestamps
        setUnreadStatus(statusMap);
        setLastMessageMap(timeMap);

        // Sort users by most recent message, fallback to name
        const sorted = usersList.sort((a, b) => {
            const timeA = timeMap[a.id] || 0;
            const timeB = timeMap[b.id] || 0;

            if (timeA === 0 && timeB === 0) {
                return a.name.localeCompare(b.name, 'he', { sensitivity: 'base' });
            }

            return timeB - timeA;
        });
        setCompanyUsers(sorted);
    };

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages]);

    // Fetch users in the same company (excluding the current user)
    const fetchCompanyUsers = async () => {
        try {
            const companyId = userData?.company?.id;
            const currentUserId = userData?.user?.id;

            if (companyId) {
                // Fetch all users from the database
                const allUsers = await getUsers();
                // Filter users who belong to the same company and are not the current user
                const filtered = Object.entries(allUsers)
                    .map(([id, user]) => ({ id, ...user }))
                    .filter((user) =>
                        user.companyIds?.some((comp) => comp.companyId === companyId) &&
                        user.id !== currentUserId
                    );

                // Check unread messages for the filtered users
                await checkUnreadMessages(filtered);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    // Fetch chat messages (private or group)
    const fetchMessages = async () => {
        try {
            const companyId = userData.company.id;
            const userId = userData.user.id;

            let data;
            // If a recipient is selected, fetch private messages between current user and recipient
            if (recipientId) {
                data = await getPrivateMessages(companyId, userId, recipientId);

                // Mark messages as seen for the current user
                await markPrivateSeen(companyId, userId, recipientId, userId);
            } else {
                // If no recipient, fetch group messages
                data = await getGroupMessages(companyId);
            }

            // Convert messages object to array and sort by timestamp
            const messagesArray = data
                ? Object.values(data).sort((a, b) => a.timestamp - b.timestamp)
                : [];

            setMessages(messagesArray);
        } catch (error) {
            console.error('Error fetching messages:', error);
            toast.error('Failed to load messages.');
        } finally {
            setIsLoading(false); // Hide loader regardless of success/failure
        }
    };

    // Sends a new chat message (private or group)
    const handleSendMessage = async () => {
        // Ignore empty or whitespace-only messages
        if (!newMessage.trim()) return;

        // Construct the message object
        const messageData = {
            senderId: userData.user.id,
            senderName: userData.user.name || 'Unknown',
            content: newMessage.trim(),
            timestamp: Date.now(), // Current time in milliseconds
        };

        try {
            const companyId = userData.company.id;
            const userId = userData.user.id;

            if (recipientId) {
                // Send private message to selected recipient
                await sendPrivateMessage(companyId, userId, recipientId, messageData);
            } else {
                // Send message to the group chat
                await sendGroupMessage(companyId, messageData);
            }

            // Add the new message to the local message list
            setMessages((prev) => [...prev, messageData]);
            // Clear the message input field
            setNewMessage('');
        } catch (error) {
            toast.error('Failed to send message.');
        }
    };

    // Checks if two timestamps fall on the same calendar date
    const isSameDate = (timestamp1, timestamp2) => {
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        return (
            date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
        );
    };

    // Returns the name of a user by their ID, or 'User' if not found
    const getUserNameById = (id) => {
        const user = companyUsers.find((u) => u.id === id);
        return user ? user.name : 'User';
    };

    if (!userData) return <Loader />;

    // Returns the full user object by ID, or undefined if not found
    const getUserById = (id) => {
        return companyUsers.find((u) => u.id === id);
    };

    return (
        <BackgroundWrapper>
            <Navbar />

            <div className="navbar-placeholder"></div>
            <div className="chat-wrapper">

                <div className="chat-layout">
                    <div className="chat-sidebar">
                        <h3>💬 Chats</h3>
                        <ul>
                            <li
                                className={`chat-link ${!recipientId ? 'active-chat' : ''}`}
                                onClick={() => navigate('/chat')}
                            >
                                🟢 Group Chat
                            </li>

                            {companyUsers.map((user) => (
                                <li
                                    key={user.id}
                                    className={`chat-link ${recipientId === user.id ? 'active-chat' : ''}`}
                                    onClick={() => navigate(`/private-chat/${user.id}`)}
                                >
                                    <span className="chat-user-wrapper">
                                        {unreadStatus[user.id] && <span className="unread-badge"></span>}
                                        {user.name}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="chat-main">

                        <div className="chat-header">
                            <img
                                src="/images/ShiftWise_Owl_Chat.png"
                                alt="Chat Owl"
                                className="chat-logo"
                            />
                            <h1>{recipientId ? `Chat with ${getUserNameById(recipientId)}` : 'Group Chat'}</h1>
                        </div>

                        {recipientId && (
                            <div className="chat-recipient-photo-wrapper">
                                <img
                                    src={getUserById(recipientId)?.photoData || '/images/Profile.jpeg'}
                                    alt="User"
                                    className="chat-recipient-photo"
                                />
                            </div>
                        )}

                        {isLoading ? (
                            <Loader />
                        ) : (
                            <>
                                <div
                                    className="chat-messages"
                                    style={{
                                        position: 'relative',
                                        backgroundImage: 'url("/images/ShiftWise_BackgroundImg.png")',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundAttachment: 'fixed',
                                    }}
                                >
                                    <div
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            backgroundColor: 'rgba(255, 255, 255, 0.6)',
                                            zIndex: 0,
                                        }}
                                    />

                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        {messages.map((msg, index) => {
                                            const currentDate = new Date(msg.timestamp);
                                            const prevDate = index > 0 ? new Date(messages[index - 1].timestamp) : null;
                                            const showDate = index === 0 || !isSameDate(currentDate, prevDate);

                                            return (
                                                <React.Fragment key={index}>
                                                    {showDate && (
                                                        <div className="date-header-wrapper">
                                                            <div className="date-header">
                                                                {currentDate.toLocaleDateString('he-IL', {
                                                                    weekday: 'short',
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric',
                                                                })}
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className={`chat-message-wrapper ${msg.senderId === userData.user.id ? 'align-left' : 'align-right'}`}>
                                                        <div className={`chat-message ${msg.senderId === userData.user.id ? 'my-message' : 'other-message'}`}>
                                                            <div className="chat-sender">{msg.senderName}</div>
                                                            <div className="chat-content">{msg.content}</div>
                                                            <div className="chat-time">
                                                                {new Date(msg.timestamp).toLocaleTimeString('he-IL', {
                                                                    hour: '2-digit',
                                                                    minute: '2-digit',
                                                                })}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                </div>

                                <div className="chat-input">
                                    <textarea
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                        rows={2}
                                    />

                                    <button onClick={handleSendMessage}>Send</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </BackgroundWrapper>
    );
};

export default ChatScreen;
