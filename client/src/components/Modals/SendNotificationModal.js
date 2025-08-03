// Import required modules and styles
import Modal from 'react-modal';
import '../../styles/EmployeesScreen.css';
import '../../styles/SendNotificationModal.css';

// Required for screen readers — sets the root element for accessibility
Modal.setAppElement('#root');

// Modal component for sending a notification to selected employees
const SendNotificationModal = ({
    isOpen,                    // Whether the modal is open
    onClose,                   // Function to close the modal
    employees,                 // Full list of employees
    selectedRecipients,        // Array of selected employee IDs
    setSelectedRecipients,     // Function to update selected recipients
    message,                   // The message content
    setMessage,                // Function to update the message
    onSubmit                   // Function to handle form submission
}) => {

    // Filter out admin users — notifications are only sent to non-admins
    const nonAdminEmployees = employees.filter(emp => emp.role !== 'admin');

    // Handles "select all" checkbox toggle
    const handleSelectAll = (isChecked) => {
        const nonAdminIds = nonAdminEmployees.map(emp => emp.id);
        setSelectedRecipients(isChecked ? nonAdminIds : []);
    };

    // Handles individual checkbox toggle for each employee
    const handleCheckboxChange = (id, isChecked) => {
        setSelectedRecipients(prev =>
            isChecked ? [...prev, id] : prev.filter(i => i !== id)
        );
    };

    return (
        // Modal component setup
        <Modal
            isOpen={isOpen}
            onRequestClose={onClose}
            className="modal"
            overlayClassName="modal-overlay"
        >
            {/* Modal title */}
            <h3>Send Notification to Employees</h3>

            {/* Notification form */}
            <form
                className="addOrEdit-employee-form notification-form"
                onSubmit={onSubmit}
            >
                {/* Recipient selection */}
                <label>Select Recipients:</label>

                {/* "Select all" checkbox */}
                <div className="employee-checkbox">
                    <input
                        type="checkbox"
                        checked={
                            nonAdminEmployees.length > 0 &&
                            nonAdminEmployees.every(emp => selectedRecipients.includes(emp.id))
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                    <span>Select All Employees</span>
                </div>

                {/* Individual employee checkboxes */}
                <div className="employee-checkboxes">
                    {nonAdminEmployees.map(emp => (
                        <div key={emp.id}>
                            <input
                                type="checkbox"
                                checked={selectedRecipients.includes(emp.id)}
                                onChange={(e) => handleCheckboxChange(emp.id, e.target.checked)}
                            />
                            <span style={{ marginLeft: '6px' }}>{emp.name}</span>
                        </div>
                    ))}
                </div>

                {/* Message textarea */}
                <label>Message:</label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Enter your message..."
                    rows={4}
                />

                {/* Modal buttons */}
                <div className="modal-buttons">
                    <button
                        type="submit"
                        className="confirm-button"
                        disabled={selectedRecipients.length === 0 || !message.trim()}
                    >
                        Send
                    </button>
                    <button
                        type="button"
                        className="cancel-button"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default SendNotificationModal;
